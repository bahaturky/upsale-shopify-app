import React, { useState, useEffect, useCallback, useRef } from "react";
import * as P from "@shopify/polaris";
import { TitleBar, useNavigate } from "@shopify/app-bridge-react";
import { Formik, Form } from "formik";
import { withTranslation } from "react-i18next";
import { object, string, number, boolean } from "yup";
import { ChevronUpMinor, ChevronDownMinor } from "@shopify/polaris-icons";
// import { WithTranslation } from "react-i18next";
import { TextField } from "../../components/formik-polaris/index.js";

import { ColorPicker, Preview, ToggleSwitch } from "../../components";

import SelectDesign from "./SelectDesign";
import SelectShape from "./SelectShape";
import SelectShadow from "./SelectShadow";
import LimitQuantity from "./LimitQuantity";

import { DEFAULT_SETTINGS } from "../../../widget/src/constants";
import useToastContext from "../../hooks/useToastContext";
import { useAuthenticatedFetch } from "../../hooks";

// import { withTranslation, Router } from "../../../i18n";

const Index = ({ t }) => {
    const [isFetching, setFetching] = useState(true);
    const [isSubmitting, setSubmitting] = useState(false);
    const [showAdvanced, setAdvanced] = useState(false);
    const [upsales, setUpsales] = useState(null);
    const [shop, setShop] = useState(null);
    const [device, setDevice] = useState("mobile");
    const fetch = useAuthenticatedFetch();
    const navigate = useNavigate();
    const addToast = useToastContext();

    useEffect(() => {
        const fetchSettings = async () => {
            // try {
            const shop = await fetch(`/api/shop`).then((res) => res.json());
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

            setFetching(false);
            // } catch (err) {
            //     console.error('useEffect Error', err);
            //     setFetching(false);
            // }
        };
        fetchSettings();
    }, []);

    const handleFormSubmit = useCallback(async (values) => {
        try {
            setSubmitting(true);

            await fetch(`/api/shop/settings`, {
                body: JSON.stringify(values),
                method: "post",
                headers: {
                    "Content-type": "application/json",
                },
            });

            setSubmitting(false);
            addToast(t("settings-saved"));
        } catch (err) {
            console.error("submit settings error", err);
            setSubmitting(false);
        }
    }, []);

    const breadcrumb = [
        {
            content: t("common:dashboard"),
            onAction: () => navigate(`/home?shop=${window.shopOrigin}`),
        },
    ];
    const secondaryActions = [
        {
            content: t("common:cancel"),
            onAction: () => navigate(`/home?shop=${window.shopOrigin}`),
        },
    ];

    const formRef = useRef();

    const restoreAllDefaults = () => {
        if (formRef.current) {
            formRef.current.setValues(DEFAULT_SETTINGS);
        }
    };

    const changeDevice = (value) => {
        setDevice(value);
    };

    let filteredUpsales = null;

    if (upsales) filteredUpsales = upsales.filter((u) => u.isActive);

    return (
        <P.Page
            breadcrumbs={breadcrumb}
            title={t("common:settings")}
            secondaryActions={[
                {
                    content: t("restore-defaults"),
                    onAction: restoreAllDefaults,
                },
            ]}
        >
            {/* <P.TextField
                label="Store name"
                // value={value}
                // onChange={handleChange}
                autoComplete="off"
            /> */}
            {isFetching ? (
                <P.Spinner
                    accessibilityLabel="Spinner"
                    size="large"
                    color="teal"
                />
            ) : (
                <Formik
                    initialValues={{
                        ...DEFAULT_SETTINGS,
                        ...shop.settings,
                    }}
                    validationSchema={object({
                        design: string().label(t("design")).required(),
                        titleText: string().label(t("common:title")).required(),
                        noThxText: string().label(t("nothx")).required(),
                        ctaText: string().label(t("continue")).required(),
                        addText: string().label(t("add")).required(),
                        addedText: string().label(t("added")).required(),
                        isTimerActive: boolean().required(),
                        timerDuration: number()
                            .label(t("timer-duration"))
                            .integer()
                            .required(),
                        timerText: string().label(t("timer-text")).required(),
                        isFreeShippingBarActive: boolean().required(),
                        freeShippingBarAmount: number().integer().required(),
                        freeShippingBarTextProgress: string(),
                        freeShippingBarTextSucess: string(),
                        displayProduct: boolean().required(),
                        topProductAddedToCartText: string().label(
                            t("top-badge")
                        ),
                        freeProductText: string()
                            .label(t("free-label"))
                            .optional(),
                        discountText: string().label(t("discount")).optional(),
                        discountCode: string()
                            .label(t("discount-code"))
                            .optional(),
                        hideDiscount: boolean()
                            .label(t("hide-discount"))
                            .optional(),
                        oneTimePerSession: boolean().required(),
                        selectedPerDefault: boolean().required(),
                        onlyOnPages: string()
                            .label(t("only-on-pages"))
                            .optional(),
                        customCSS: string().optional(),
                    })}
                    onSubmit={handleFormSubmit}
                    innerRef={formRef}
                >
                    {({ values, dirty, handleSubmit, setFieldValue }) => (
                        <>
                            {!IS_OFFLINE && (
                                <TitleBar
                                    title={t("common:settings")}
                                    primaryAction={{
                                        content: t("common:save"),
                                        disabled: !dirty,
                                        onAction: handleSubmit,
                                        loading: isSubmitting,
                                    }}
                                    secondaryActions={secondaryActions}
                                    breadcrumbs={breadcrumb}
                                />
                            )}
                            <div className="relative">
                                <Form>
                                    <div className="w-full md:w-350px">
                                        <P.Layout>
                                            <P.Layout.Section secondary>
                                                <div className="hidden md:block">
                                                    <P.Card sectioned>
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
                                                            onChange={
                                                                changeDevice
                                                            }
                                                            selected={device}
                                                        />
                                                    </P.Card>
                                                </div>
                                                <SelectDesign t={t} />
                                                <SelectShape t={t} />
                                                <SelectShadow t={t} />
                                                <P.Card
                                                    title={t("select-texts")}
                                                >
                                                    <P.Card.Section>
                                                        <TextField
                                                            name="titleText"
                                                            label={t(
                                                                "common:title"
                                                            )}
                                                            placeholder={
                                                                DEFAULT_SETTINGS.titleText
                                                            }
                                                            maxLength={70}
                                                            showCharacterCount
                                                        />
                                                    </P.Card.Section>
                                                    <P.Card.Section>
                                                        <TextField
                                                            name="noThxText"
                                                            label={t(
                                                                "btn-nothx"
                                                            )}
                                                            placeholder={
                                                                DEFAULT_SETTINGS.noThxText
                                                            }
                                                            maxLength={30}
                                                            showCharacterCount
                                                        />
                                                    </P.Card.Section>
                                                    <P.Card.Section>
                                                        <TextField
                                                            name="ctaText"
                                                            label={t(
                                                                "btn-continue"
                                                            )}
                                                            placeholder={
                                                                DEFAULT_SETTINGS.ctaText
                                                            }
                                                            maxLength={30}
                                                            showCharacterCount
                                                        />
                                                        <P.Checkbox
                                                            label={t(
                                                                "btn-continue-price"
                                                            )}
                                                            checked={
                                                                values.isCtaPriceActive
                                                            }
                                                            onChange={() =>
                                                                setFieldValue(
                                                                    "isCtaPriceActive",
                                                                    !values.isCtaPriceActive
                                                                )
                                                            }
                                                        />
                                                    </P.Card.Section>
                                                    <P.Card.Section>
                                                        <TextField
                                                            name="addText"
                                                            label={t(
                                                                "add-to-cart"
                                                            )}
                                                            placeholder={
                                                                DEFAULT_SETTINGS.addedText
                                                            }
                                                            maxLength={20}
                                                            showCharacterCount
                                                        />
                                                    </P.Card.Section>
                                                    <P.Card.Section>
                                                        <TextField
                                                            name="addedText"
                                                            label={t(
                                                                "added-to-cart"
                                                            )}
                                                            placeholder={
                                                                DEFAULT_SETTINGS.addedText
                                                            }
                                                            maxLength={20}
                                                            showCharacterCount
                                                        />
                                                    </P.Card.Section>
                                                    <P.Card.Section>
                                                        <TextField
                                                            name="freeProductText"
                                                            label={t(
                                                                "free-label"
                                                            )}
                                                            placeholder={
                                                                DEFAULT_SETTINGS.freeProductText
                                                            }
                                                            maxLength={20}
                                                            showCharacterCount
                                                        />
                                                    </P.Card.Section>
                                                    <P.Card.Section>
                                                        <TextField
                                                            name="readMoreText"
                                                            label={t(
                                                                "read-more"
                                                            )}
                                                            placeholder={
                                                                DEFAULT_SETTINGS.readMoreText
                                                            }
                                                            maxLength={20}
                                                            showCharacterCount
                                                        />
                                                    </P.Card.Section>
                                                    <P.Card.Section>
                                                        <TextField
                                                            name="backText"
                                                            label={t("back")}
                                                            placeholder={
                                                                DEFAULT_SETTINGS.backText
                                                            }
                                                            maxLength={20}
                                                            showCharacterCount
                                                        />
                                                    </P.Card.Section>
                                                    <P.Card.Section>
                                                        <TextField
                                                            name="discountText"
                                                            label={t(
                                                                "discount"
                                                            )}
                                                            disabled={
                                                                values.hideDiscount
                                                            }
                                                            placeholder={
                                                                DEFAULT_SETTINGS.discountText
                                                            }
                                                        />
                                                        <br />
                                                        <TextField
                                                            name="customDiscountText"
                                                            label={t(
                                                                "custom-discount"
                                                            )}
                                                            disabled={
                                                                values.hideDiscount
                                                            }
                                                            placeholder={
                                                                DEFAULT_SETTINGS.customDiscountText
                                                            }
                                                        />
                                                        <br />
                                                        <P.Checkbox
                                                            label={t(
                                                                "hide-discount"
                                                            )}
                                                            checked={
                                                                values.hideDiscount
                                                            }
                                                            helpText={t(
                                                                "hide-discount-disclaimer"
                                                            )}
                                                            onChange={() =>
                                                                setFieldValue(
                                                                    "hideDiscount",
                                                                    !values.hideDiscount
                                                                )
                                                            }
                                                        />
                                                    </P.Card.Section>
                                                </P.Card>
                                                <P.Card sectioned>
                                                    <P.Checkbox
                                                        label={t(
                                                            "icons-bar-label"
                                                        )}
                                                        checked={
                                                            values.isIconsBarActive
                                                        }
                                                        onChange={() =>
                                                            setFieldValue(
                                                                "isIconsBarActive",
                                                                !values.isIconsBarActive
                                                            )
                                                        }
                                                    />
                                                    <P.Collapsible
                                                        open={
                                                            values.isIconsBarActive
                                                        }
                                                    >
                                                        <br />
                                                        <P.FormLayout>
                                                            <TextField
                                                                name="iconsBarLeft"
                                                                placeholder={t(
                                                                    "icons-bar-left-placeholder"
                                                                )}
                                                            />
                                                            <TextField
                                                                name="iconsBarRight"
                                                                placeholder={t(
                                                                    "icons-bar-right-placeholder"
                                                                )}
                                                            />
                                                        </P.FormLayout>
                                                    </P.Collapsible>
                                                </P.Card>
                                                <P.Card sectioned>
                                                    <P.Checkbox
                                                        label={t(
                                                            "free-shipping-bar-label"
                                                        )}
                                                        checked={
                                                            values.isFreeShippingBarActive
                                                        }
                                                        onChange={() =>
                                                            setFieldValue(
                                                                "isFreeShippingBarActive",
                                                                !values.isFreeShippingBarActive
                                                            )
                                                        }
                                                    />
                                                    <P.Collapsible
                                                        open={
                                                            values.isFreeShippingBarActive
                                                        }
                                                    >
                                                        <br />
                                                        <P.FormLayout>
                                                            <TextField
                                                                label={t(
                                                                    "free-shipping-bar-amount-label"
                                                                )}
                                                                name="freeShippingBarAmount"
                                                                placeholder={
                                                                    DEFAULT_SETTINGS.freeShippingBarAmount
                                                                }
                                                                type="number"
                                                                suffix="€"
                                                            />
                                                            <TextField
                                                                label={t(
                                                                    "free-shipping-bar-text-progress-label"
                                                                )}
                                                                name="freeShippingBarTextProgress"
                                                                placeholder={t(
                                                                    "free-shipping-bar-text-progress-placeholder"
                                                                )}
                                                            />
                                                            <TextField
                                                                label={t(
                                                                    "free-shipping-bar-text-sucess-label"
                                                                )}
                                                                name="freeShippingBarTextSucess"
                                                                placeholder={t(
                                                                    "free-shipping-bar-text-sucess-placeholder"
                                                                )}
                                                            />
                                                            <P.Banner
                                                                title="Setup free shipping"
                                                                status="info"
                                                            >
                                                                <p>
                                                                    If you want
                                                                    to see how
                                                                    to setup
                                                                    free
                                                                    shipping on
                                                                    a given
                                                                    amount,
                                                                    please check
                                                                    the faq.
                                                                </p>
                                                            </P.Banner>
                                                        </P.FormLayout>
                                                    </P.Collapsible>
                                                </P.Card>
                                                <P.Card sectioned>
                                                    <P.Checkbox
                                                        label={t("timer-label")}
                                                        checked={
                                                            values.isTimerActive
                                                        }
                                                        onChange={() =>
                                                            setFieldValue(
                                                                "isTimerActive",
                                                                !values.isTimerActive
                                                            )
                                                        }
                                                    />
                                                    <P.Collapsible
                                                        open={
                                                            values.isTimerActive
                                                        }
                                                    >
                                                        <br />
                                                        <P.FormLayout>
                                                            <TextField
                                                                name="timerDuration"
                                                                label={t(
                                                                    "timer-duration-label"
                                                                )}
                                                                type="number"
                                                                min={1}
                                                                max={100}
                                                                suffix="(minutes)"
                                                            />
                                                            <TextField
                                                                name="timerText"
                                                                label={t(
                                                                    "timer-text-label"
                                                                )}
                                                                placeholder={
                                                                    DEFAULT_SETTINGS.timerText
                                                                }
                                                            />
                                                        </P.FormLayout>
                                                    </P.Collapsible>
                                                </P.Card>
                                                <P.Card
                                                    title={t("select-colors")}
                                                >
                                                    <P.Card.Section>
                                                        <ColorPicker
                                                            name="primaryColor"
                                                            label={t(
                                                                "primary-color"
                                                            )}
                                                            t={t}
                                                        />
                                                    </P.Card.Section>
                                                    <P.Card.Section>
                                                        <ColorPicker
                                                            name="secondaryColor"
                                                            label={t(
                                                                "secondary-color"
                                                            )}
                                                            t={t}
                                                        />
                                                    </P.Card.Section>
                                                    <P.Card.Section>
                                                        <ColorPicker
                                                            name="noThxColor"
                                                            label={t(
                                                                "nothx-color"
                                                            )}
                                                            t={t}
                                                        />
                                                    </P.Card.Section>
                                                    {values.isTimerActive && (
                                                        <P.Card.Section>
                                                            <ColorPicker
                                                                name="timerColor"
                                                                label={t(
                                                                    "timer-color"
                                                                )}
                                                                t={t}
                                                            />
                                                        </P.Card.Section>
                                                    )}
                                                    {values.isFreeShippingBarActive && (
                                                        <P.Card.Section>
                                                            <ColorPicker
                                                                name="shippingBarColor"
                                                                label={t(
                                                                    "shipping-bar-color"
                                                                )}
                                                                t={t}
                                                            />
                                                        </P.Card.Section>
                                                    )}
                                                    <P.Card.Section>
                                                        <ColorPicker
                                                            name="actionColor"
                                                            label={t(
                                                                "action-color"
                                                            )}
                                                            t={t}
                                                        />
                                                        <br />
                                                        <P.Checkbox
                                                            label={t(
                                                                "action-color-inverse"
                                                            )}
                                                            checked={
                                                                values.actionColorInverse
                                                            }
                                                            onChange={() =>
                                                                setFieldValue(
                                                                    "actionColorInverse",
                                                                    !values.actionColorInverse
                                                                )
                                                            }
                                                        />
                                                    </P.Card.Section>
                                                </P.Card>
                                                {/* <LimitQuantity {...{ t }} /> */}

                                                <P.Card
                                                    title={t("redirect")}
                                                    sectioned
                                                >
                                                    <P.Select
                                                        name="redirect"
                                                        label={t("redirect")}
                                                        options={[
                                                            {
                                                                label: "Same as current behavior",
                                                                value: "default",
                                                            },
                                                            {
                                                                label: "Redirect to checkout",
                                                                value: "checkout",
                                                            },
                                                            {
                                                                label: "Redirect to cart",
                                                                value: "cart",
                                                            },
                                                        ]}
                                                        onChange={(
                                                            selected,
                                                            id
                                                        ) => {
                                                            setFieldValue(
                                                                "redirect",
                                                                selected
                                                            );
                                                        }}
                                                        value={values.redirect}
                                                    />
                                                </P.Card>

                                                <P.Card sectioned>
                                                    <P.Button
                                                        icon={
                                                            showAdvanced
                                                                ? ChevronUpMinor
                                                                : ChevronDownMinor
                                                        }
                                                        plain
                                                        onClick={() =>
                                                            setAdvanced(
                                                                !showAdvanced
                                                            )
                                                        }
                                                    >
                                                        {showAdvanced
                                                            ? t("hide-advanced")
                                                            : t(
                                                                  "show-advanced"
                                                              )}
                                                    </P.Button>

                                                    <P.Collapsible
                                                        open={showAdvanced}
                                                    >
                                                        <P.FormLayout>
                                                            <P.Checkbox
                                                                label={t(
                                                                    "one-time-per-session"
                                                                )}
                                                                checked={
                                                                    values.oneTimePerSession
                                                                }
                                                                onChange={() =>
                                                                    setFieldValue(
                                                                        "oneTimePerSession",
                                                                        !values.oneTimePerSession
                                                                    )
                                                                }
                                                            />
                                                            <P.Checkbox
                                                                label={t(
                                                                    "selected-per-default"
                                                                )}
                                                                checked={
                                                                    values.selectedPerDefault
                                                                }
                                                                onChange={() =>
                                                                    setFieldValue(
                                                                        "selectedPerDefault",
                                                                        !values.selectedPerDefault
                                                                    )
                                                                }
                                                            />
                                                            <TextField
                                                                name="customCSS"
                                                                label={t(
                                                                    "custom-css"
                                                                )}
                                                                multiline={4}
                                                                placeholder=".top-bar {background: red!important;}"
                                                            />
                                                            <TextField
                                                                name="onlyOnPages"
                                                                label={t(
                                                                    "only-on-pages"
                                                                )}
                                                                multiline={4}
                                                                placeholder="/home,/collection/perfums,/category/*"
                                                            />
                                                            <p>
                                                                Display the
                                                                modal only on
                                                                these URLs
                                                                (separated by
                                                                commas). Use *
                                                                at the end to
                                                                open the modal
                                                                on all URLs
                                                                under a specific
                                                                path, e.g.,
                                                                /category/*.
                                                                Keep this field
                                                                empty to display
                                                                the upsells on
                                                                all pages.
                                                            </p>
                                                        </P.FormLayout>
                                                    </P.Collapsible>
                                                </P.Card>
                                            </P.Layout.Section>
                                            <Preview
                                                className="mt-8"
                                                upsales={
                                                    filteredUpsales &&
                                                    filteredUpsales.length
                                                        ? filteredUpsales
                                                        : []
                                                }
                                                shop={{
                                                    ...shop,
                                                    settings: {
                                                        ...values,
                                                        showPreviewPrice: true,
                                                    },
                                                }}
                                                device={device}
                                                sticky={true}
                                            />
                                        </P.Layout>
                                        <br />
                                        <P.PageActions
                                            primaryAction={{
                                                content: t("common:save"),
                                                disabled: !dirty,
                                                onAction: handleSubmit,
                                                loading: isSubmitting,
                                            }}
                                        />
                                    </div>
                                </Form>
                            </div>
                        </>
                    )}
                </Formik>
            )}
        </P.Page>
    );
};

export default withTranslation("settings")(Index);
