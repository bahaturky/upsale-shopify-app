import { DeliveryMethod } from "@shopify/shopify-api";

import models from "./models/index.js";

export default {
    PRODUCTS_DELETE: {
        deliveryMethod: DeliveryMethod.Http,
        callbackUrl: "webhooks",
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
