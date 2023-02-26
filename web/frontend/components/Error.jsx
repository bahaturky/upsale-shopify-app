import React from "react";
import { EmptyState, Card } from "@shopify/polaris";

const Error = ({ title, statusCode }) => {
    return (
        <Card sectioned>
            <EmptyState
                heading={title}
                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
            >
                <p>Error Code: {statusCode}</p>
            </EmptyState>
        </Card>
    );
};

export default Error;
