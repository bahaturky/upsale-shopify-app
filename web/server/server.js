import { join, dirname } from "path";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import express from "express";

import serveStatic from "serve-static";
import request from "request";
import { LATEST_API_VERSION } from "@shopify/shopify-api";
import Shopify from "shopify-api-node";

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import shopify, { checkSubscription, initializeShop } from "../shopify.js";
import productCreator from "../product-creator.js";
import GDPRWebhookHandlers from "../gdpr.js";

import UpsaleHandler from "./handlers/upsales.handlers.js";
import ShopHandler from "./handlers/shops.handlers.js";
import AnalyticsHandler from "./handlers/analytics.handlers.js";
import EarlyHandler from "./handlers/earlybirds.handlers.js";
// import WebhooksHandler from "./handlers/webhooks.js";
import models from "../models/index.js";

import s3Client from "./helpers/s3Client.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// @ts-ignore
const PORT = parseInt(process.env.BACKEND_PORT || process.env.PORT, 10);
console.log(PORT, "PORT");
const HOST = process.env.HOST;

const STATIC_PATH =
    process.env.NODE_ENV === "production"
        ? `${process.cwd()}/frontend/dist`
        : `${process.cwd()}/frontend/`;

const app = express();

// app.use("/*", async (req, res, next) => {
//     console.log(req.url, "test");
//     // res.send('ok');

// });

// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
    shopify.config.auth.callbackPath,
    shopify.auth.callback(),
    async (req, res, next) => {
        const { shop, accessToken } = res.locals.shopify.session;

        const shopifyNode = new Shopify({
            shopName: shop.split(".myshopify")[0],
            accessToken,
            apiVersion: LATEST_API_VERSION,
        });

        // res.shopify = shopifyNode;

        const shopData = await shopifyNode.shop.get();
        console.log(req.headers["x-forwarded-for"]);

        const shopDB = await models.Shop.findOne({
            where: {
                domain: shop,
            },
            raw: true,
        });

        await initializeShop(res, shopifyNode, shopData);
        // console.log(shop, accessToken);
        // // const shopData = await;
        // // const shopData = await shopify.shop.get();
        // console.log(shopData);
        request(
            {
                method: "POST",
                url: "https://platform.shoffi.app/v1/newMerchant",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    api_key: process.env.SHOPIFY_API_KEY,
                    shopName: shop,
                    appId: shopData.id,
                    XFF: req.headers["x-forwarded-for"],
                }),
            },
            function (error, response) {
                if (error) {
                    console.log("shoffi error", error);
                }
                console.log("shoffi response.body", response.body);
            }
        );

        next();
    },
    shopify.redirectToShopifyOrAppRoot()
);

// app.post(
//     '/webhooks/app/uninstalled',
// )
app.post(
    shopify.config.webhooks.path,
    shopify.processWebhooks({ webhookHandlers: GDPRWebhookHandlers })
);

app.get("/upsales/:upsaleId/redirect", async (req, res) => {
    try {
        const { shop, accessToken } = res.locals.shopify.session;
        const { upsaleId } = req.params;

        const upsale = await models.Upsale.findOne({
            where: { id: upsaleId },
            include: models.Shop,
        });

        if (!upsale) {
            res.sendStatus(404);
            return;
        }

        const shopify = new Shopify({
            shopName: upsale.shop.domain,
            accessToken: upsale.shop.accessToken,
            apiVersion: LATEST_API_VERSION,
            timeout: 1000,
        });

        const query = `
            query productById($id: ID!) {
                product(id: $id) {
                    handle
                }
            }
        `;

        const { product } = await shopify.graphql(query, { id: upsale.gId });

        if (!product) {
            res.sendStatus(404);
            return;
        }

        res.redirect(
            `https://${upsale.shop.domain}/products/${product.handle}`
        );
    } catch (e) {
        console.error(e);
        res.sendStatus(500);
    }
});

app.get("/upsales/:upsaleId/product", async (req, res) => {
    try {
        const { upsaleId } = req.params;

        const upsale = await models.Upsale.findOne({
            where: { id: upsaleId },
            include: models.Shop,
        });

        if (!upsale) {
            res.sendStatus(404);
            return;
        }

        const shopify = new Shopify({
            shopName: upsale.shop.domain,
            accessToken: upsale.shop.accessToken,
            apiVersion: process.env.API_VERSION,
            timeout: 1000,
        });

        const query = `
            query productById($id: ID!) {
            product(id: $id) {
                title
                description
                handle
                images(first: 10) {
                edges {
                    node {
                    id
                    url
                    altText
                    }
                }
                }
                variants(first: 10) {
                edges {
                    node {
                    id
                    image {
                        id
                        url
                        altText
                    }
                    }
                }
                }
            }
            }
        `;

        const { product } = await shopify.graphql(query, { id: upsale.gId });

        if (!product) {
            res.sendStatus(404);
            return;
        }

        res.json(
            _.mapValues(product, (value, key) =>
                value.edges ? value.edges.map((i) => i.node) : value
            )
        );
    } catch (e) {
        console.error(e);

        res.sendStatus(500);
    }
});

app.get("/upsales/:upsaleId/discount", async (req, res) => {
    try {
        const { upsaleId } = req.params;

        const upsale = await models.Upsale.findOne({
            where: { id: upsaleId },
            include: models.Shop,
        });

        if (!upsale || !upsale.customDiscountCode) {
            res.sendStatus(404);
            return;
        }

        const shopify = new Shopify({
            shopName: upsale.shop.domain,
            accessToken: upsale.shop.accessToken,
            apiVersion: process.env.API_VERSION,
            timeout: 1000,
        });

        const query = `
            query discountByCode {
                priceRules (first: 190) {
                    edges {
                    node {
                        id
                        valueV2 {
                        ... on MoneyV2 {
                            amount
                        }
                        ... on PricingPercentageValue {
                            percentage
                        }
                        }
                        discountCodes(first: 1) {
                        edges {
                            node {
                            code
                            }
                        }
                        }
                    }
                    }
                }
            }
        `;

        const { priceRules } = await shopify.graphql(query);
        const priceRule = priceRules?.edges?.find((i) =>
            i.node.discountCodes.edges.find(
                (j) => j.node.code === upsale.customDiscountCode
            )
        );

        if (!priceRule) {
            res.sendStatus(404);
            return;
        }

        res.json(priceRule.node.valueV2);
    } catch (e) {
        console.error(e);

        res.sendStatus(500);
    }
});

app.get("/scripts/island.js", async (req, res) => {
    const response = await ShopHandler.getPublicData(req, res);

    let script = null;

    if (response) {
        const { settings, upsales, shop } = response;
        if (shop && shop.isSubscriptionActive) {
            script = `
                islandUpsell={settings:${settings},upsales:${JSON.stringify(
                upsales
            )},shop:${JSON.stringify(shop)},HOST:"${HOST}"};

                var widget = document.createElement('script');
                widget.setAttribute('src', '${HOST}/widget/build/static/js/bundle.min.js');
                widget.setAttribute('type', 'text/javascript');
                document.body.appendChild(widget);
            `;
            res.type(".js");
        }
    }

    res.send(script);
});

app.get("/img/*", (req, res) => {
    res.sendFile(join(__dirname, "../frontend/", req.url));
});

app.get('/cart.js', (req, res) => {
    res.sendFile(join(__dirname, './cart.js'))
})

app.get('/logo.svg', (req, res) => {
    res.sendFile(join(__dirname, '../frontend/assets/logo.svg'))
})

app.get("/locales/*", (req, res) => {
    res.sendFile(join(__dirname, "../frontend/", req.url));
});

app.get("/widget/build/:filename", async (req, res) => {
    console.log(req.params);
    const options = {
        root: join(__dirname, "../widget/build/"),
    };
    res.sendFile(req.params.filename, options);
});

app.use("/widget/build/static/js/:filename", async (req, res) => {
    const options = {
        root: join(__dirname, "../widget/build/static/js/"),
    };
    res.sendFile(req.params.filename, options);
});

// app.use('/img/*', async(req, res) => {
//     // console.log(req.)
//     res.sendFile(join(__dirname, ''))
// })

// All endpoints after this point will require an active session
app.use(
    "/api/*",
    shopify.validateAuthenticatedSession(),
    async (req, res, next) => {
        const { shop, accessToken } = res.locals.shopify.session;

        const shopifyNode = new Shopify({
            shopName: shop.split(".myshopify")[0],
            accessToken,
            apiVersion: LATEST_API_VERSION,
        });

        res.shopify = shopifyNode;
        next();
    }
);

app.use(express.json());

app.post("/api/food", AnalyticsHandler.track);

// Early birds when they install the app from the early offer pages
app.post("/api/early", EarlyHandler.add);

app.get("/api/shop", ShopHandler.get);
app.post("/api/shop/settings", ShopHandler.updateSettings);
app.post("/api/shop/dismissSetup", ShopHandler.dismissSetup);
app.post("/api/shop/toggleApp", ShopHandler.toggleApp);

app.get("/api/shop/:id/food", AnalyticsHandler.list);

app.get("/api/upsales", UpsaleHandler.list);
app.get("/api/upsales/:id", UpsaleHandler.get);
app.post("/api/upsales", UpsaleHandler.create);
app.post("/api/upsales/positions", UpsaleHandler.positions);
app.post("/api/upsales/:id", UpsaleHandler.update);
app.post("/api/upsales/:id/toggle", UpsaleHandler.toggle);
app.delete("/api/upsales/:id", UpsaleHandler.delete);

app.put("/api/upsales/:upsaleId/image", async (req, res) => {
    const { upsaleId } = req.params;
    const { fileName, contentType } = req.body;

    const bucketParams = {
        Bucket: process.env.SPACES_BUCKET,
        Key: `upsales/${upsaleId}/${fileName}`,
        ContentType: contentType,
        ACL: "public-read",
    };

    try {
        const url = await getSignedUrl(
            s3Client,
            new PutObjectCommand(bucketParams),
            { expiresIn: 15 * 60 }
        );
        const imageUrl = `https://${process.env.SPACES_BUCKET}.${process.env.SPACES_REGION}.digitaloceanspaces.com/upsales/${upsaleId}/${fileName}`;

        res.json({ url, imageUrl });
    } catch (err) {
        console.log("Error", err);

        res.sendStatus(500);
    }
});

app.get("/api/products/count", async (_req, res) => {
    const countData = await shopify.api.rest.Product.count({
        session: res.locals.shopify.session,
    });
    res.status(200).send(countData);
});

app.get("/api/products/create", async (_req, res) => {
    let status = 200;
    let error = null;

    try {
        await productCreator(res.locals.shopify.session);
    } catch (e) {
        console.log(`Failed to process products/create: ${e.message}`);
        status = 500;
        error = e.message;
    }
    res.status(status).send({ success: status === 200, error });
});

app.use(serveStatic(STATIC_PATH, { index: false }));

app.use(
    "/*",
    (req, res, next) => {
        console.log(req.baseUrl);
        next();
    },
    shopify.ensureInstalledOnShop(),
    async (req, res, next) => {
        if (req.query.shop) {
            // console.log('check subscription part')
            await checkSubscription(req, res, next)
        } else {
            next()
        }
    },
    async (_req, res, _next) => {
        return res
            .status(200)
            .set("Content-Type", "text/html")
            .send(readFileSync(join(STATIC_PATH, "index.html")));
    }
);

app.listen(PORT);
