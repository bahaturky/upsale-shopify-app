import { TitleBar, useNavigate } from "@shopify/app-bridge-react";

import { withTranslation } from "react-i18next";
// import {  } from "react-router-dom";

const TitleBarC = ({ breadcrumbs, title, t }) => {
    const navigate = useNavigate();
    const secondaryActions = [
        { content: t("dashboard"), url: "/home" },
        { content: t("faq"), url: "/questions" },
        { content: t("settings"), url: "/settings" },
        {
            content: t("support"),
            onAction: () => {
                if ($crisp && typeof $crisp.is === "function") {
                    $crisp.push(["do", "chat:open"]);
                } else {
                    navigate(`/support?shop=${window.shopOrigin}`);
                }
            },
        },
    ];

    return (
        !IS_OFFLINE && (
            <TitleBar
                title={title}
                primaryAction={{
                    content: t("new-upsell"),
                    onAction: () =>
                        router.push(
                            {
                                pathname: "/upsale",
                                query: {
                                    id: "new",
                                    shop: window.shopOrigin,
                                },
                            },
                            "/upsale/new"
                        ),
                }}
                secondaryActions={secondaryActions}
                breadcrumbs={breadcrumbs || null}
            />
        )
    );
};

export default withTranslation("common")(TitleBarC);
