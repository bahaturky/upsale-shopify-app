import React from "react";
import { Layout, Page, TextContainer, Heading, Card } from "@shopify/polaris";

import { TitleBar } from "../components";
import { withTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const FAQ = ({ t }) => {
    const navigate = useNavigate();
    const breadcrumbs = [
        {
            content: t("common:dashboard"),
            onAction: () => navigate(`/?shop=${window.shopOrigin}`),
        },
    ];

    return (
        <Page breadcrumbs={breadcrumbs} title={t("common:contact")}>
            <TitleBar title={t("common:contact")} breadcrumbs={breadcrumbs} />
            <Layout>
                <Layout.Section>
                    <Card>
                        <div className="static-text px-12 md:px-64 py-24">
                            <div className="mt-12 first:mt-0">
                                <TextContainer>
                                    <Heading>
                                        {t("common:contact-title")}
                                    </Heading>
                                    <p>{t("common:contact-content")}</p>
                                </TextContainer>
                            </div>
                        </div>
                    </Card>
                </Layout.Section>
            </Layout>
        </Page>
    );
};

export default withTranslation("faq")(FAQ);
