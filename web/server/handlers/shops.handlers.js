import fs, { access } from "fs";
import Shopify from "shopify-api-node";
// import schedule from "node-schedule";

import Cache from "../cache.js";

import models from "../../models/index.js";
import { getProductsVariants } from "../helpers/shopify-queries.js";
// import generatedUpsales from "./generatedUpsales.json" assert { type: "json" };

import { readFile } from "fs/promises";

const generatedUpsales = JSON.parse(
    await readFile(new URL("./generatedUpsales.json", import.meta.url))
);

const freePlans = ["affiliate", "partner_test", "basic", "dormant"];

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}

const create = async (res, shopify, shopData) => {
    try {
        const { shop, accessToken } = res.locals.shopify.session;

        let shopDB = await models.Shop.findOne({ where: { domain: shop } });

        let isNew = false;

        const plan = shopData.plan_name;

        const shopDataToAdd = {
            email: shopData.email,
            customerEmail: shopData.customer_email,
            shopName: shopData.name,
            owner: shopData.shop_owner,
            plan,
            city: shopData.city,
            countryName: shopData.country_name,
            currency: shopData.currency,
            shopCreatedOn: shopData.created_at,
            moneyFormat: shopData.money_format,
        };

        if (freePlans.includes(plan)) {
            shopDataToAdd.isSubscriptionActive = true;
        }

        if (!shopDB) {
            isNew = true;

            // const affiliate = ctx.cookies.get("island-partner") || null;
            const affiliate = null;

            shopDB = await models.Shop.create({
                domain: shop,
                accessToken,
                ...shopDataToAdd,
                affiliate,
            });

            if (
                !process.env.IS_OFFLINE &&
                shopDataToAdd.email !== "julian@canopyand.co"
            ) {
                let isEarlyBird = null;

                try {
                    const early50 = JSON.parse(
                        fs.readFileSync("early-50.json")
                    );
                    const early100 = JSON.parse(
                        fs.readFileSync("early-100.json")
                    );

                    if (early50.includes(shop)) isEarlyBird = 50;
                    if (early100.includes(shop)) isEarlyBird = 100;
                } catch (err) {
                    console.log("telesend earlybird err", err);
                }
            }
        } else {
            await shopDB.update({
                accessToken,
                ...shopDataToAdd,
            });
        }

        // We create a few upsales to new users so their dashboard is not empty
        // And they can start experimenting right away
        console.log("isNew", isNew);

        if (isNew) {
            let i = 0;

            const IMAGES_HOST =
                "https://res.cloudinary.com/island/image/upload/v1627982780";

            await asyncForEach(
                generatedUpsales,
                async ({ title, desc, price, compare_at_price, img }) => {
                    try {
                        console.log(
                            `${i + 1}/${generatedUpsales.length} - ${title}`
                        );

                        const newCustomProduct = await shopify.product.create({
                            title,
                            body_html: desc,
                            product_type: "island_generated",
                            published_scope: "web",
                            variants: [
                                {
                                    price,
                                    compare_at_price,
                                    requires_shipping: false,
                                    inventory_policy: "continue",
                                },
                            ],
                            images: [
                                {
                                    src: `${IMAGES_HOST}/${img}.png`,
                                },
                            ],
                        });

                        await models.Upsale.create({
                            shopId: shopDB.id,
                            gId: newCustomProduct.admin_graphql_api_id,
                            title: title,
                            desc: desc,
                            isActive: false,
                            selectedVariants: ["all"],
                            position: i++,
                            targets: JSON.stringify(["all"]),
                        });
                    } catch (err) {
                        console.log(err.message || err);
                    }
                }
            );
        }

        // ctx.body = shop;
        // res.json(shop);
        return shop;
    } catch (err) {
        console.log("create shop err", err);
        res.sendStatus(422);
    }
};

const updateSettings = async (req, res) => {
    try {
        const { shop, accessToken } = res.locals.shopify.session;
        const shopDB = await models.Shop.findOne({ where: { domain: shop } });

        if (!shopDB) res.sendStatus(404);

        await shopDB.update({ settings: JSON.stringify(req.body) });

        // ctx.body = shopDB;
        res.json(shopDB);
    } catch (err) {
        res.sendStatus(422);
    }
};

const get = async (req, res) => {
    try {
        const { shop, accessToken } = res.locals.shopify.session;

        const shopDB = await models.Shop.findOne({
            where: { domain: shop },
        });

        if (!shopDB) res.sendStatus(404);

        // ctx.body = shopDB;
        res.json(shopDB);
    } catch (err) {
        console.log("get shop err", err);

        if (err.name === "CastError" || err.name === "NotFoundError") {
            res.sendStatus(404);
        } else {
            res.sendStatus(500);
        }

        // ctx.throw(500);
    }
};

// When new users install the app, the upsell popup is disabled by default
// They can switch it on and off from their dashboard
const toggleApp = async (req, res) => {
    try {
        const { shop, accessToken } = res.locals.shopify.session;
        console.log(shop, accessToken)
        const shopDB = await models.Shop.findOne({
            where: { domain: shop },
        });

        if (!shopDB) res.sendStatus(404);

        await shopDB.update({ isAppEnabled: !shopDB.isAppEnabled });

        // ctx.body = shopDB;
        res.json(shopDB);
    } catch (err) {
        console.log("get shop err", err);
        if (err.name === "CastError" || err.name === "NotFoundError") {
            res.sendStatus(404);
        } else {
            res.sendStatus(500);
        }
    }
};

const isVariantAvailable = (variant) =>
    !variant.inventoryManagement ||
    variant.inventoryManagement.toLowerCase() === "not_managed" ||
    variant.inventoryPolicy.toLowerCase() === "continue" ||
    variant.inventoryQuantity > 0;

// Public data: store setting & upsales
// To be sent to their stores to customize the upsell popup
const getPublicData = async (req, res) => {
    // const { shop, accessToken } = res.locals.shopify.session;
    const shop = req.query.shop;
    // console.log(shop.shop)
    const shopDB = await models.Shop.findOne({
        where: { domain: shop },
        raw: true,
    });
    
    if (!shopDB) res.sendStatus(404);
    if (!shopDB.isAppEnabled) return null;
    
    try {
        const upsales = await models.Upsale.findAll({
            where: {
                shopId: shopDB.id,
                isActive: true,
            },
            raw: true,
            order: [["position", "ASC"]],
        });

        if (!upsales || !upsales.length) {
            return {
                shop: {
                    domain: shopDB.domain,
                    id: shopDB.id,
                    isSubscriptionActive: shopDB.isSubscriptionActive,
                    isAppVerified: shopDB.isAppVerified,
                    moneyFormat: shopDB.moneyFormat,
                },
                settings: shopDB.settings,
                upsales: [],
            };
        }

        const shopify = new Shopify({
            shopName: shopDB.domain.split(".myshopify")[0],
            accessToken: shopDB.accessToken,
            apiVersion: process.env.API_VERSION,
        });

        let productsWithVariants = await shopify.graphql(
            getProductsVariants(upsales.map((u) => u.gId))
        );

        if (productsWithVariants && productsWithVariants.nodes) {
            productsWithVariants = productsWithVariants.nodes.map((p) => ({
                ...p,
                variants: p
                    ? p.variants.edges.reduce(
                        (acc, v) =>
                            isVariantAvailable(v.node)
                                ? [...acc, v.node]
                                : acc,
                        []
                    )
                    : [],
            }));
        }

        return {
            shop: {
                domain: shopDB.domain,
                id: shopDB.id,
                isSubscriptionActive: shopDB.isSubscriptionActive,
                isAppVerified: shopDB.isAppVerified,
                moneyFormat: shopDB.moneyFormat,
            },
            settings: shopDB.settings,
            upsales: (
                await Promise.all(
                    upsales.map(async (u) => {
                        const product =
                            productsWithVariants &&
                            productsWithVariants.find((pv) => pv.id === u.gId);

                        let targets = JSON.parse(u.targets);

                        targets = await Promise.all(
                            targets.map(async (t) => {
                                const shopId = shopDB.id;
                                const handle = t.handle;
                                const id = t.id;

                                if (!id || !id.includes("Collection")) {
                                    return t;
                                }

                                const cacheKey = `shop.${shopId}.collections.${handle}.products`;

                                // TO REVIEW CACHE IN PRODUCTION
                                // console.log(cacheKey, Cache.has(cacheKey));

                                if (Cache.has(cacheKey)) {
                                    // console.log(Cache.get(cacheKey));
                                }

                                // if (!Cache.has(cacheKey) || Cache.isExpired(cacheKey, 3600)) {

                                try {
                                    let perPage = 250;
                                    let queryString = "first: " + perPage;

                                    let productsArr = [];

                                    for (var i = 0; i <= 4; i++) {
                                        const collectionsQuery = `
                                            {
                                            collectionByHandle(handle: "${handle}") {
                                                products( ${queryString} ) {
                                                edges {
                                                    cursor
                                                    node {
                                                    id
                                                    }
                                                }
                                                pageInfo {
                                                    hasNextPage
                                                }
                                                }
                                            }
                                            }
                                        `;

                                        const collectionsResponse =
                                            await shopify.graphql(
                                                collectionsQuery
                                            );

                                        collectionsResponse.collectionByHandle?.products?.edges.map(
                                            (e) => {
                                                productsArr.push(e);
                                            }
                                        );

                                        if (
                                            collectionsResponse
                                                .collectionByHandle?.products
                                                .pageInfo.hasNextPage
                                        ) {
                                            const lastIndex = perPage - 1;
                                            const cursor =
                                                collectionsResponse
                                                    .collectionByHandle.products
                                                    .edges[lastIndex].cursor;
                                            queryString =
                                                'first: 250, after: "' +
                                                cursor +
                                                '"';
                                        } else {
                                            break;
                                        }
                                    }

                                    // const productsResponse = await shopify.graphql(productsQuery);
                                    // const collection = productsResponse.collectionByHandle;

                                    if (productsArr) {
                                        const products = productsArr.map(
                                            (e) => e.node.id
                                        );

                                        Cache.set(cacheKey, products);
                                    }
                                } catch (e) {
                                    console.log(e);
                                }
                                // }

                                if (Cache.has(cacheKey)) {
                                    t.products = Cache.get(cacheKey);
                                }

                                return t;
                            })
                        );

                        if (!product) {
                            return {
                                ...u,
                                targets,
                                variants: [],
                            };
                        }

                        const upsaleVariants = product.variants;

                        return {
                            ...u,
                            image: product.featuredImage
                                ? product.featuredImage.transformedSrc
                                : product.featuredImage,
                            targets,
                            variants:
                                u.selectedVariants &&
                                    u.selectedVariants.length &&
                                    !u.selectedVariants.includes("all")
                                    ? upsaleVariants.filter((uv) =>
                                        u.selectedVariants.includes(uv.id)
                                    )
                                    : upsaleVariants,
                        };
                    })
                )
            ).filter((u) => !!u.variants.length),
        };
    } catch (err) {
        // console.log(
        //     "getPublicData err",
        //     err && err.message ? err.message : err
        // );
        console.log(err)
        // res.sendStatus(500);
        throw new Error('Get Public data error')
    }
};

// To hide the onboarding box
const dismissSetup = async (req, res) => {
    try {
        // const { shop } = ctx.session;
        const { shop, accessToken } = res.locals.shopify.session;
        const shopDB = await models.Shop.findOne({ where: { domain: shop } });

        if (!shopDB) res.status(404).send("No Shop!");

        await shopDB.update({ setupDismissed: true });

        // ctx.body = shopDB;
        res.json(shopDB);
    } catch (err) {
        console.log("dismissSetup", err);

        // ctx.throw(422);
        res.status(422).send(err.message);
    }
};

export default {
    dismissSetup,
    getPublicData,
    toggleApp,
    get,
    create,
    updateSettings,
};
