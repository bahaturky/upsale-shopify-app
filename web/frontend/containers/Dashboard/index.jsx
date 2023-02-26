import { useState, useEffect } from "react";
import {
    EmptyState,
    Page,
    Spinner,
    Layout,
    Banner,
    Card,
    Button,
    Heading,
} from "@shopify/polaris";
// import axios from "../../axios";

import { withTranslation } from "react-i18next";
import { TitleBar, Preview, ToggleSwitch } from "../../components";
import UpsalesList from "./UpsalesList";
import Performance from "./Performance";
import SetupBox from "./SetupBox";

import useToastContext from "../../hooks/useToastContext";
import { useAuthenticatedFetch } from "../../hooks";
// import {} from "@shopify/app-bridge-react";
import { createSearchParams, useNavigate } from "react-router-dom";
// import { useRouter } from "../../hooks/useRouter";

const img = "https://cdn.shopify.com/s/files/1/0757/9955/files/empty-state.svg";

// const Index = ({ t }) => {
//     return <div>Dashboard</div>;
// };

const Index = ({ t }) => {
    const [isLoading, setLoading] = useState(true);
    const [hideBrandingMsg, setHideBrandingMsg] = useState(false);
    const [upsales, setUpsales] = useState(null);
    const [shop, setShop] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [device, setDevice] = useState("mobile");

    const addToast = useToastContext();
    const fetch = useAuthenticatedFetch();
    // const router = useRouter();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const shop = await fetch(`/api/shop`, {}).then((res) =>
                    res.json()
                );
                if (shop) {
                    const parsedSettings = shop.settings
                        ? JSON.parse(shop.settings)
                        : null;

                    setShop({ ...shop, settings: parsedSettings });
                }

                const upsales = await fetch(`/api/upsales`).then((res) =>
                    res.json()
                );

                if (upsales) {
                    setUpsales(upsales);
                }

                // analytics
                const food = await fetch(`/api/shop/${shop.id}/food`).then(
                    (res) => res.json()
                );

                if (food) setAnalytics(food);
                setLoading(false);

                setDevice("mobile");
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    let filteredUpsales = null;

    if (upsales) filteredUpsales = upsales.filter((u) => u.isActive);

    const goNewUpsell = () => {
        navigate(`/upsale/new`);
    };

    const dismissSetup = async (save = false) => {
        try {
            setShop({ ...shop, setupDismissed: true });

            if (save) {
                await axios.patch(`${HOST}/api/shop/dismissSetup`);
                console.log("setup dismissed");
            }
        } catch (err) {
            console.error("dismissSetup error", err);
        }
    };

    const toggleApp = async () => {
        try {
            setShop({ ...shop, isAppEnabled: !shop.isAppEnabled });
            await fetch(`/api/shop/toggleApp`, {
                body: JSON.stringify({}),
                method: "post",
                headers: {
                    "Content-type": "application/json",
                },
            });

            addToast(
                `App ${
                    !shop.isAppEnabled
                        ? t("common:activated")
                        : t("common:deactivated")
                }.`
            );
        } catch (err) {
            console.error("toggleApp error", err);
        }
    };

    const changeDevice = (value) => {
        setDevice(value);
    };

    const handleSetupBoxAction = (action) => {
        if (action === "enable-app") {
            toggleApp();
        }

        if (action === "go-upsell-list") {
            location.hash = "#upsell-list";
        }

        if (action === "go-new-upsell") {
            goNewUpsell();
        }

        if (action === "open-chat") {
            if ($crisp && typeof $crisp.is === "function") {
                $crisp.push(["do", "chat:open"]);
            } else {
                navigate(`/support?shop=${window.shopOrigin}`);
            }
        }
    };

    // return <div>dashboard</div>;

    return (
        <Page>
            <TitleBar title={t("common:dashboard")} />
            {isLoading ? (
                <Layout>
                    <Layout.Section>
                        <Spinner />
                    </Layout.Section>
                </Layout>
            ) : upsales && upsales.length ? (
                <>
                    {!shop.isAppVerified && !hideBrandingMsg && (
                        <div className="my-12">
                            <Banner
                                title={t("remove-branding-title")}
                                action={{
                                    content: t("contact-support"),
                                    onAction: () => {
                                        if (
                                            $crisp &&
                                            typeof $crisp.is === "function"
                                        ) {
                                            $crisp.push(["do", "chat:open"]);
                                        } else {
                                            navigate(
                                                `/support?shop=${window.shopOrigin}`
                                            );
                                        }
                                    },
                                }}
                                status="info"
                                onDismiss={() => setHideBrandingMsg(true)}
                            >
                                <p>{t("remove-branding-p")}</p>
                            </Banner>
                        </div>
                    )}
                    {!shop.setupDismissed && (
                        <SetupBox
                            t={t}
                            shop={shop}
                            upsales={upsales}
                            onDismiss={dismissSetup}
                            onAction={handleSetupBoxAction}
                        />
                    )}
                    <Performance
                        t={t}
                        food={analytics}
                        shop={shop}
                        toggleApp={toggleApp}
                    />
                    <br />
                    <div id="upsell-list" className="relative">
                        <div className="w-full md:w-350px">
                            <Card>
                                <div className="py-6 px-8">
                                    <div className="hidden md:block">
                                        <ToggleSwitch
                                            options={[
                                                {
                                                    icon: "phone",
                                                    value: "mobile",
                                                },
                                                {
                                                    icon: "computer",
                                                    value: "desktop",
                                                },
                                            ]}
                                            onChange={changeDevice}
                                            selected={device}
                                        />
                                    </div>
                                    <br />
                                    <Heading>{t("upsells-list")}</Heading>
                                    <div className="mt-3">
                                        <UpsalesList
                                            t={t}
                                            upsales={upsales}
                                            setUpsales={setUpsales}
                                        />
                                        <div className="flex items-center justify-center w-full mt-8">
                                            <Button
                                                primary
                                                fullWidth
                                                size="large"
                                                onClick={goNewUpsell}
                                            >
                                                {t("common:new-upsell")}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                        <Preview
                            upsales={
                                filteredUpsales && filteredUpsales.length
                                    ? filteredUpsales
                                    : []
                            }
                            shop={shop}
                            device={device}
                        />
                    </div>
                </>
            ) : (
                <EmptyState
                    heading={t("add-upsale-h")}
                    action={{
                        content: t("add-upsale"),
                        onAction: goNewUpsell,
                    }}
                    image={img}
                >
                    <p>{t("create-upsale")}</p>
                </EmptyState>
            )}
        </Page>
    );
};

// Index.getInitialProps = ({ query, t }) => {
//     return { query, t };
// };

export default withTranslation("dashboard")(Index);
