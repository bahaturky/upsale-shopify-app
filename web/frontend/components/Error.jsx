import React from "react";
import { LegacyCard, EmptyState } from "@shopify/polaris";

const Error = ({ title, statusCode }) => {
    return (
        <LegacyCard sectioned>
            <EmptyState
                heading={title}
                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
            >
                <p>Error Code: {statusCode}</p>
            </EmptyState>
        </LegacyCard>
    );
};

export default Error;
