import React from "react";
import { Layout, Page, TextContainer, Heading, Card } from "@shopify/polaris";
import { withTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { TitleBar } from "../components";

const FAQ = ({ t }) => {
    const navigate = useNavigate();
    const breadcrumbs = [
        {
            content: t("common:dashboard"),
            onAction: () => navigate(`/?shop=${window.shopOrigin}`),
        },
    ];
    const FAQ = t("faq", { returnObjects: true });
    return (
        <Page breadcrumbs={breadcrumbs} title={t("common:faq")}>
            <TitleBar title={t("common:faq")} breadcrumbs={breadcrumbs} />
            <Layout>
                <Layout.Section>
                    <Card>
                        <div className="static-text px-12 md:px-64 py-24">
                            {FAQ &&
                                Array.isArray(FAQ) &&
                                FAQ.map(({ q, a }, i) => (
                                    <div className="mt-12 first:mt-0" key={i}>
                                        <TextContainer>
                                            <Heading>{q}</Heading>
                                            <div
                                                dangerouslySetInnerHTML={{
                                                    __html: a,
                                                }}
                                            ></div>
                                        </TextContainer>
                                    </div>
                                ))}
                        </div>
                    </Card>
                </Layout.Section>
            </Layout>
        </Page>
    );
};

export default withTranslation(["faq", "common"])(FAQ);
