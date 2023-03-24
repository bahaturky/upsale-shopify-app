import { Session } from "@shopify/shopify-api";
import models from "./models/index.js";
import { LATEST_API_VERSION } from "@shopify/shopify-api";
import Shopify from "shopify-api-node";
import { initializeShop1 } from "./shopify.js";

class MySessionStorage {
    async storeSession(session) {
        // console.log("storesession", session);
        try {
            await this.upsert(session, { id: session.id });
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    upsert(values, condition) {
        return models.Session.findOne({ where: condition, raw: true }).then(
            (record) => {
                console.log(record);
                // update
                if (record)
                    return models.Session.update(values, { where: condition });
                // insert
                return models.Session.create(values);
            }
        );
    }

    async loadSession(id) {
        console.log("loadSession", id);
        try {
            const row = await models.Session.findOne({
                where: { id: id },
                raw: true,
            });
            console.log(row)

            if (row && row.shop) {
                const shopDB = await models.Shop.findOne({
                    where: {
                        domain: row.shop,
                    },
                    raw: true,
                });
                
                if (shopDB) return this.makeSessionPropertyArray(row);
            }
            return undefined;
        } catch (error) {
            console.error(error);
            return undefined;
        }
    }

    async deleteSession(id) {
        try {
            await models.Session.destroy({ where: { id: id } });
            return true;
        } catch (error) {
            console.error(error);
            return undefined;
        }
    }

    async deleteSessions(ids) {
        try {
            await models.Session.destroy({ where: { id: ids } });
            return true;
        } catch (error) {
            console.error(error);
            return undefined;
        }
    }

    async findSessionsByShop(shop) {
        if (!shop) return [];
        try {
            const result = await models.Session.findOne({
                where: { shop: shop },
                raw: true,
            });

            if (result) {
                return [this.makeSessionPropertyArray(result)];
            }
            return [];
        } catch (error) {
            console.error(error);
            return [];
        }
    }

    makeSessionPropertyArray(row) {
        const array = [
            ["id", row.id],
            ["shop", row.shop],
            ["state", row.state],
            ["isOnline", row.isOnline],
            ["accessToken", row.accessToken],
            ["scope", row.scope],
            ["expires", row.expires ? row.expires * 1000 : null],
        ];

        return Session.fromPropertyArray(array);
    }
}

export default MySessionStorage;
