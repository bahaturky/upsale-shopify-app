import { BillingInterval, LATEST_API_VERSION } from "@shopify/shopify-api";
import { shopifyApp } from "@shopify/shopify-app-express";
import { restResources } from "@shopify/shopify-api/rest/admin/2023-01";
import { PostgreSQLSessionStorage } from "@shopify/shopify-app-session-storage-postgresql";
import Shopify from "shopify-api-node";
import fs from "fs";

import MySessionStorage from "./session-storage.js";
import shopsHandlers from "./server/handlers/shops.handlers.js";
import models from "./models/index.js";

const freePlans = ["affiliate", "partner_test", "basic", "dormant"];

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
// console.log()

// We use the Shopify ScriptTag API to add our script to their storefront
const addScriptTag = async (shopify) => {
    console.log(HOST, 'HOST>>>>>>>>>>>>')
    try {
        // It will call below url on every page of their storefront
        const src = `${HOST}/scripts/island.js`;

        const scripts = await shopify.scriptTag.list({ src });
        console.log(scripts)
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

export const getSubscriptionUrl = async (
    shopify,
    shopPlan,
    shopDomain,
    shopDB
) => {
    /*
      possible plans types:
      staff, custom, singtel_basic,singtel_unlimited, dormant, partner_test
      cancelled,staff_business,frozen,
      singtel_unlimited,npo_lite,singtel_professional,singtel_trial,npo_full,business,
      singtel_basic,uafrica_professional,sales_training,singtel_starter,uafrica_basic,
      fraudulent,starter,comped,shopify_alumni
      trial, affiliate, basic, professional, unlimited, shopify_plus, enterprise
  
      https://community.shopify.com/c/Shopify-APIs-SDKs/Enumeration-of-plan-name-from-GET-admin-shop-json/m-p/273614
    */

    let trialDays = 10;

    // We give 10 free trial days by default
    // But if they went through the early bird page, we'll give them 50/100 instead

    const early50 = JSON.parse(fs.readFileSync("early-50.json"));
    const early100 = JSON.parse(fs.readFileSync("early-100.json"));
    let isEarlyBird = null;

    if (early50.includes(shopDomain)) isEarlyBird = 50;
    if (early100.includes(shopDomain)) isEarlyBird = 100;
    if (isEarlyBird) trialDays = isEarlyBird;

    console.log("isEarlyBird", shopDomain, isEarlyBird);

    // We don't give them those trial days every time they install the app
    // So we check if they already installed, and when
    // If they installed 7 days ago then uninstall and reinstall today, we'll give 14 - 7 (days since first creation) = 7 days of free trial

    if (shopDB) {
        const oneDay = 24 * 60 * 60 * 1000; // hours * minutes * seconds * milliseconds
        const appFirstInstallDate = new Date(shopDB.createdAt);
        const today = new Date();
        const diffDays = Math.round(
            Math.abs((appFirstInstallDate - today) / oneDay)
        );
        trialDays = trialDays - diffDays > 0 ? trialDays - diffDays : 0;
    }

    const PLANS = [
        { name: "BASIC SHOPIFY", amount: 9.99 },
        { name: "STANDARD SHOPIFY", amount: 29.99 },
        { name: "ADVANCED SHOPIFY", amount: 79.99 },
        { name: "SHOPIFY PLUS", amount: 169.99 },
    ];

    let selectedPlan = 0;

    if (shopPlan) {
        selectedPlan =
            shopPlan === "basic"
                ? 0
                : shopPlan === "professional"
                    ? 1
                    : shopPlan === "unlimited" || shopPlan === "staff"
                        ? 2
                        : shopPlan === "shopify_plus" || shopPlan === "enterprise"
                            ? 3
                            : 0;
    }

    const query = `
      mutation appSubscriptionCreate($name: String!, $lineItems: [AppSubscriptionLineItemInput!]!, $returnUrl: URL!, $test: Boolean, $trialDays: Int) {
        appSubscriptionCreate(name: $name, lineItems: $lineItems, returnUrl: $returnUrl, test: $test, trialDays: $trialDays) {
          confirmationUrl
          appSubscription {
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
        "name": `${PLANS[selectedPlan].name}${isEarlyBird ? ` - EARLY BIRD - ${isEarlyBird} DAYS FREE` : ""}`,
        "returnUrl": `${process.env.HOST}/?shop=${shopDomain}`,
        "test": null,
        // "test": true,
        "trialDays": trialDays,
        "lineItems": [
            {
                "plan": {
                    "appRecurringPricingDetails": {
                        "price": {
                            "amount": PLANS[selectedPlan].amount,
                            "currencyCode": "USD",
                        },
                    },
                },
            },
        ],
    };

    try {
        const response = await shopify.graphql(query, variables);
        // console.log(response)
        if (response.appSubscriptionCreate.userErrors) {
            console.log(response.appSubscriptionCreate.userErrors)
            throw new Error('User Error')
        }
        return response.appSubscriptionCreate.confirmationUrl;
    } catch (error) {
        console.log("getSubscriptionUrl", error);
        return null;
    }
};

const shopify = shopifyApp({
    api: {
        apiVersion: LATEST_API_VERSION,
        restResources,
        billing: billingConfig, // or replace with billingConfig above to enable example billing
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

export const checkSubscription = async (req, res, next) => {
    try {

        const shop = req.query.shop;
        const shopDB = await models.Shop.findOne({ where: { domain: shop } });

        if (!shopDB) return res.sendStatus(404);

        const { accessToken } = shopDB;

        const shopifyNode = new Shopify({
            shopName: shop.split(".myshopify")[0],
            accessToken,
            apiVersion: process.env.API_VERSION,
        });
        console.log(shopDB.plan, 'plan')
        if (freePlans.includes(shopDB.plan)) {
            next();
        } else {
            const subscriptionCharge = await shopifyNode.recurringApplicationCharge.list();
            console.log(subscriptionCharge, 'subscriptionCharge')
            const isSubscriptionActive =
                subscriptionCharge &&
                subscriptionCharge.length &&
                (subscriptionCharge[0].status === "active" ||
                    !!subscriptionCharge.find((sub) => sub.status === "active"));

            if (shopDB.isSubscriptionActive !== isSubscriptionActive) {
                await shopDB.update({ isSubscriptionActive });
            }
            console.log(isSubscriptionActive, 'isSubscriptionActive')
            if (!isSubscriptionActive) {
                const confirmUrl = await getSubscriptionUrl(
                    shopifyNode,
                    // shopDB.plan,
                    'basic',
                    shop,
                    shopDB
                );
                console.log(confirmUrl, 'confirmurl')
                res.send(redirectionScript({
                    origin: shop,
                    redirectTo: confirmUrl || `https://${req.hostname}`,
                    apiKey: process.env.SHOPIFY_API_KEY,
                }));
            } else next();
        }
    } catch (error) {
        console.log(error)
        next()
    }
}

export function redirectionScript({ origin, redirectTo, apiKey }) {
    return `
      <script src="https://unpkg.com/@shopify/app-bridge@^1"></script> <script type="text/javascript">
        document.addEventListener('DOMContentLoaded', function() {
          if (window.top === window.self) {
            // If the current window is the 'parent', change the URL by setting location.href
            window.location.href = '${redirectTo}';
          } else {
            // If the current window is the 'child', change the parent's URL with postMessage
            var AppBridge = window['app-bridge'];
            var createApp = AppBridge.default;
            var Redirect = AppBridge.actions.Redirect;
            var app = createApp({
              apiKey: '${apiKey}',
              shopOrigin: '${origin}',
            });
            var redirect = Redirect.create(app);
            redirect.dispatch(Redirect.Action.REMOTE, '${redirectTo}');
          }
        });
      </script>
    `;
}

export default shopify;
