import { BillingInterval, LATEST_API_VERSION } from "@shopify/shopify-api";
import { shopifyApp } from "@shopify/shopify-app-express";
import { restResources } from "@shopify/shopify-api/rest/admin/2023-01";
import { PostgreSQLSessionStorage } from "@shopify/shopify-app-session-storage-postgresql";

import MySessionStorage from "./session-storage.js";
import shopsHandlers from "./server/handlers/shops.handlers.js";

// The transactions with Shopify will always be marked as test transactions, unless NODE_ENV is production.
// See the ensureBilling helper to learn more about billing in this template.
const billingConfig = {
    "My Shopify One-Time Charge": {
        // This is an example configuration that would do a one-time charge for $5 (only USD is currently supported)
        amount: 5.0,
        currencyCode: "USD",
        interval: BillingInterval.OneTime,
    },
};

const HOST = process.env.HOST || "https://39e9-140-238-99-165.eu.ngrok.io";

// We use the Shopify ScriptTag API to add our script to their storefront
const addScriptTag = async (shopify) => {
    try {
        // It will call below url on every page of their storefront
        const src = `${HOST}/scripts/island.js`;

        const scripts = await shopify.scriptTag.list({ src });

        if (!!!scripts || scripts.length === 0) {
            const query = `
                mutation scriptTagCreate($input: ScriptTagInput!) {
                    scriptTagCreate(input: $input) {
                    scriptTag {
                        id
                    }
                    userErrors {
                        field
                        message
                    }
                    }
                }
                `;

            // prettier-ignore
            const variables = {
                "input": {
                    "displayScope": "ALL",
                    "src": `${src}`,
                },
        };

            await shopify.graphql(query, variables);
        } else if (scripts.length > 1) {
            await Promise.all(
                scripts
                    .slice(0, -1)
                    .map(({ id }) => shopify.scriptTag.delete(id))
            );
        }

        return "ok";
    } catch (error) {
        console.log("addScriptTag", error);
    }
};

const shopify = shopifyApp({
    api: {
        apiVersion: LATEST_API_VERSION,
        restResources,
        billing: undefined, // or replace with billingConfig above to enable example billing
    },
    auth: {
        path: "/api/auth",
        callbackPath: "/api/auth/callback",
    },
    webhooks: {
        path: "/api/webhooks",
    },
    // This should be replaced with your preferred storage strategy
    sessionStorage: new MySessionStorage(),
});

export const initializeShop = async (res, shopifyNode, shopData) => {
    await shopsHandlers.create(res, shopifyNode, shopData);

    addScriptTag(shopifyNode);
};

export default shopify;
