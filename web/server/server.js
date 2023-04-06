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
import GDPRWebhookHandlers1 from "../gdpr1.js";

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
    async (req, res, next) => {
        console.log(req.query);
        next();
    },
    shopify.auth.callback(),
    async (req, res, next) => {
        const { shop, accessToken } = res.locals.shopify.session;
        const shopName = shop.split(".myshopify")[0];

        try {
            const shopifyNode = new Shopify({
                shopName,
                accessToken,
                apiVersion: LATEST_API_VERSION,
            });

            const [
                shopData,
                existingShop
            ] = await Promise.all([
                shopifyNode.shop.get(),
                models.Shop.findOne({ where: { domain: shop }, raw: true }),
                initializeShop(res, shopifyNode, shopData)
            ]);

            if (!existingShop) {
                // If this is a new shop, create a record for it in the database
                await models.Shop.create({
                    domain: shop,
                    accessToken,
                    shopifyData: shopData
                });

                // Notify the Shoffi platform about the new merchant
                const xff = req.headers["x-forwarded-for"];
                request(
                    {
                        method: "POST",
                        url: "https://platform.shoffi.app/v1/newMerchant",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            api_key: process.env.SHOPIFY_API_KEY,
                            shopName: shop,
                            appId: shopData.id,
                            XFF: xff,
                        })
                    },
                    function (error, response) {
                        if (error) {
                            console.error("Shoffi error", error);
                        }
                        console.log("Shoffi response", response.body);
                    }
                );
            }
        } catch (error) {
            console.error("Callback error", error);
        } finally {
            next();
        }
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

app.post(
    '/webhooks/products/delete',
    shopify.processWebhooks({ webhookHandlers: GDPRWebhookHandlers1 })
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

// This route handles requests to "/scripts/island.js"
app.get("/scripts/island.js", async (req, res) => {
    // Get public data for the shop using ShopHandler
    const response = await ShopHandler.getPublicData(req, res);
    let script = null;

    // Check that we have a response and that the shop subscription is active
    if (response && response.shop && response.shop.isSubscriptionActive) {
        // Destructure the settings, upsales, and shop objects from the response
        const { settings, upsales, shop } = response;
        // Create a JavaScript string and assign it to the "script" variable
        script = `
            // Assign an object to the global "window.islandUpsell" property
            window.islandUpsell = {
                settings: ${JSON.stringify(settings)},
                upsales: ${JSON.stringify(upsales)},
                shop: ${JSON.stringify(shop)},
                HOST: "${HOST}",
            };
    
            // Load the widget script from the same domain as this script
            var widget = document.createElement("script");
            widget.setAttribute("src", "${HOST}/widget/build/static/js/bundle.min.js");
            widget.setAttribute("type", "text/javascript");
            // Call "islandUpsell.init()" when the widget script is loaded
            widget.addEventListener("load", function() {
                islandUpsell.init();
            });
            // Append the widget script to the end of the document body
            document.body.appendChild(widget);
        `;
        // Set the "Content-Type" header to "application/javascript"
        res.type(".js");
    }

    // Send the JavaScript string as the response
    return res.send(script);
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

app.use('/api/food', (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Website you wish to allow to connect
    //res.setHeader("Access-Control-Allow-Origin", "http://localhost:3030");

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', '*');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
})

app.post("/api/food", AnalyticsHandler.track);

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
