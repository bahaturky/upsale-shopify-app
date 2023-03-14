import { TitleBar, useNavigate } from "@shopify/app-bridge-react";

import { withTranslation } from "react-i18next";
import { createSearchParams } from "react-router-dom";
// import {  } from "react-router-dom";

const TitleBarC = ({ breadcrumbs, title, t }) => {
    const navigate = useNavigate();
    const secondaryActions = [
        {
            content: t("dashboard"),
            onAction: () => {
                navigate("/home");
            },
        },
        {
            content: t("faq"),
            url: "/questions",
            onAction: () => {
                navigate("/questions");
            },
        },
        {
            content: t("settings"),
            onAction: () => {
                navigate("/settings");
            },
            url: "/settings",
        },
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
                    onAction: () => navigate("/upsell/new"),
                }}
                secondaryActions={secondaryActions}
                breadcrumbs={breadcrumbs || null}
            />
        )
    );
};

export default withTranslation("common")(TitleBarC);
