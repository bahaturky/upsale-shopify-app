import { DeliveryMethod } from "@shopify/shopify-api";
import * as postmark from "postmark";

import models from "./models/index.js";

const emailClient = new postmark.ServerClient(
    process.env.POSTMARK_TOKEN || "816d627d-1194-4186-b88d-9fb1e5bf6556"
);

const sendEmail = (TemplateAlias, TemplateModel, To) =>
    emailClient.sendEmailWithTemplate({
        From: "support@islandapps.co",
        To,
        TemplateAlias,
        TemplateModel,
    });

export default {
    /**
     * Customers can request their data from a store owner. When this happens,
     * Shopify invokes this webhook.
     *
     * https://shopify.dev/docs/apps/webhooks/configuration/mandatory-webhooks#customers-data_request
     */
    CUSTOMERS_DATA_REQUEST: {
        deliveryMethod: DeliveryMethod.Http,
        callbackUrl: "/api/webhooks",
        callback: async (topic, shop, body, webhookId) => {
            const payload = JSON.parse(body);
            // Payload has the following shape:
            // {
            //   "shop_id": 954889,
            //   "shop_domain": "{shop}.myshopify.com",
            //   "orders_requested": [
            //     299938,
            //     280263,
            //     220458
            //   ],
            //   "customer": {
            //     "id": 191167,
            //     "email": "john@example.com",
            //     "phone": "555-625-1199"
            //   },
            //   "data_request": {
            //     "id": 9999
            //   }
            // }
        },
    },

    APP_UNINSTALLED: {
        deliveryMethod: DeliveryMethod.Http,
        callbackUrl: "/api/webhooks",
        callback: async (topic, shop, body, webhookId) => {
            // console.log(topic, shop, body, webhookId);
            const payload = JSON.parse(body);
            try {
                // const { webhook } = ctx.state;
                // console.log("received webhook:", webhook.topic, webhook.domain);
                if (shop && payload.id) {
                    const shopDB = await models.Shop.findOne({
                        where: { domain: shop },
                    });

                    // if (!shopDB) ctx.throw(404);
                    if (!shopDB) throw new Error("404 not found");

                    await shopDB.update({
                        isSubscriptionActive: false,
                        isAppEnabled: false,
                        shopUninstalledOn: new Date(),
                    });

                    sendEmail(
                        "uninstall",
                        {
                            firstName: shopDB.owner
                                ? shopDB.owner.split(" ")[0]
                                : "",
                        },
                        shopDB.email
                    );
                }
                // ctx.res.statusCode = 200;
            } catch (err) {
                console.log("gdpr", err && err.message ? err.message : err);

                throw new Error(err && err.message ? err.message : err);
            }
        },
    },
    /**
     * Store owners can request that data is deleted on behalf of a customer. When
     * this happens, Shopify invokes this webhook.
     *
     * https://shopify.dev/docs/apps/webhooks/configuration/mandatory-webhooks#customers-redact
     */
    CUSTOMERS_REDACT: {
        deliveryMethod: DeliveryMethod.Http,
        callbackUrl: "/api/webhooks",
        callback: async (topic, shop, body, webhookId) => {
            const payload = JSON.parse(body);
            // Payload has the following shape:
            // {
            //   "shop_id": 954889,
            //   "shop_domain": "{shop}.myshopify.com",
            //   "customer": {
            //     "id": 191167,
            //     "email": "john@example.com",
            //     "phone": "555-625-1199"
            //   },
            //   "orders_to_redact": [
            //     299938,
            //     280263,
            //     220458
            //   ]
            // }
        },
    },

    /**
     * 48 hours after a store owner uninstalls your app, Shopify invokes this
     * webhook.
     *
     * https://shopify.dev/docs/apps/webhooks/configuration/mandatory-webhooks#shop-redact
     */
    SHOP_REDACT: {
        deliveryMethod: DeliveryMethod.Http,
        callbackUrl: "/api/webhooks",
        callback: async (topic, shop, body, webhookId) => {
            const payload = JSON.parse(body);
            // Payload has the following shape:
            // {
            //   "shop_id": 954889,
            //   "shop_domain": "{shop}.myshopify.com"
            // }
        },
    },

    PRODUCTS_DELETE: {
        deliveryMethod: DeliveryMethod.Http,
        callbackUrl: "/api/webhooks",
        callback: async (topic, shop, body, webhookId) => {
            try {
                console.log('text')
                // const { webhook } = ctx.state;
                // console.log("received webhook: ", webhook);
                const payload = JSON.parse(body);
                if (shop && webhookId) {
                    const shopDB = await models.Shop.findOne({
                        where: { domain: shop },
                    });

                    if (!shopDB) throw Error("ShopDB not found");

                    const upsale = await models.Upsale.findOne({
                        where: {
                            gId: `gid://shopify/Product/${payload.id}`,
                            shopId: shopDB.id,
                        },
                    });

                    // No upsale linked to this product → Do nothing
                    if (!upsale) return;

                    await upsale.destroy();
                }
                // ctx.res.statusCode = 200;
            } catch (err) {
                console.log(
                    "onProductDelete ss",
                    err && err.message ? err.message : err
                );
            }
        },

    }
};
