import models, { sequelize } from "../../models/index.js";

// import Cache from "../cache.js";

import {
    listProducts,
    listCollections,
    getProductsVariants,
} from "../helpers/shopify-queries.js";

const randomString = (length) =>
    Math.round(Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))
        .toString(36)
        .slice(1);

const getPriceRuleData = ({
    discountId,
    discount,
    productId,
    targets,
    allProductsCollectionId,
}) => ({
    ...(discountId
        ? {
              title: discountId,
              target_type: "line_item",
              target_selection: "entitled",
              allocation_method: "each",
              value_type: "percentage",
              customer_selection: "all",
              starts_at: new Date().toISOString(),
              prerequisite_to_entitlement_quantity_ratio: {
                  prerequisite_quantity: 1,
                  entitled_quantity: 1,
              },
              allocation_limit: 1,
          }
        : {}),
    value: `-${discount}`,
    entitled_product_ids: [parseInt(productId)],
    ...(targets.includes("all")
        ? {
              prerequisite_collection_ids: [parseInt(allProductsCollectionId)],
              prerequisite_product_ids: [],
          }
        : {
              prerequisite_collection_ids: targets[0].id.includes("Collection/")
                  ? targets.map((t) => parseInt(t.id.split("Collection/")[1]))
                  : [],
              prerequisite_product_ids: targets[0].id.includes("Product/")
                  ? targets.map((t) => parseInt(t.id.split("Product/")[1]))
                  : [],
          }),
});

const updateAllCollectionIdIfNecesary = async (payload, shopDB, res) => {
    // If user didn't select a specific target for this upsale, we have to display it on all products
    // If there is not "allProductsCollection" already, we will create one that will have all products inside
    if (payload.targets.includes("all") && !shopDB.allProductsCollectionId) {
        const allProductsCollection = await res.shopify.smartCollection.create({
            title: "All Products",
            sort_order: "best-selling",
            disjunctive: false,
            rules: [
                {
                    column: "type",
                    relation: "not_equals",
                    condition: "island_generated",
                },
            ],
            published_scope: "web",
        });
        await shopDB.update({
            allProductsCollectionId: allProductsCollection.id,
        });
    }
};

const createPriceRuleAndDiscount = async (payload, shopDB, res) => {
    const discountId = `ISLAND-${randomString(10).toUpperCase()}`;
    const priceRuleData = getPriceRuleData({
        discountId,
        discount: payload.discount,
        productId: payload.gId.split("Product/")[1],
        targets: payload.targets,
        allProductsCollectionId: shopDB.allProductsCollectionId,
    });

    const priceRule = await res.shopify.priceRule.create(priceRuleData);

    const discountCode = await res.shopify.discountCode.create(priceRule.id, {
        code: discountId,
    });
    return { priceRule, discountCode };
};

const create = async (req, res) => {
    try {
        const { shop, accessToken } = res.locals.shopify.session;
        const payload = req.body;

        const shopDB = await models.Shop.findOne({ where: { domain: shop } });

        if (!shopDB) res.sendStatus(404);

        // We need to get the others upsales positions so we add the new one to the end of the list
        const findHigherPosition = await models.Upsale.findAll({
            where: { shopId: shopDB.id },
            order: [["position", "DESC"]],
            limit: 1,
            raw: true,
        });
        const position =
            findHigherPosition && findHigherPosition.length
                ? findHigherPosition[0].position + 1
                : 1;

        let newUpsale = null;

        if (!!payload.discount && payload.discount !== "0") {
            // Create a collection listing all store's products if there isn't one yet
            await updateAllCollectionIdIfNecesary(payload, shopDB, res);

            const { priceRule, discountCode } =
                await createPriceRuleAndDiscount(payload, shopDB, res);

            newUpsale = await models.Upsale.create({
                ...payload,
                shopId: shopDB.id,
                position,
                targets: JSON.stringify(payload.targets),
                priceRuleId: priceRule.id,
                discountId: discountCode.id,
                discountCode: discountCode.code,
            });
        } else {
            newUpsale = await models.Upsale.create({
                ...payload,
                shopId: shopDB.id,
                position,
                targets: JSON.stringify(payload.targets),
            });
        }

        console.log(
            `new upsale - ${shop} - ${newUpsale.id}${
                !!payload.discount && payload.discount !== "0"
                    ? ` - discount ${payload.discount}`
                    : ""
            }`
        );

        res.json(newUpsale);
    } catch (err) {
        console.log("create upsale", err, JSON.stringify(err));
        res.sendStatus(422);
    }
};

const update = async (req, res) => {
    try {
        const { shop, accessToken } = res.locals.shopify.session;
        const { id } = req.params;
        const payload = req.body;
        const shopDB = await models.Shop.findOne({ where: { domain: shop } });

        if (!shopDB) res.sendStatus(404);

        const upsale = await models.Upsale.findOne({
            where: { id, shopId: shopDB.id },
        });

        if (!upsale) res.sendStatus(404);

        // if they set the discount to 0 and there was a discount before, we have to delete it with its priceRule
        if (payload.discount === "0" && upsale.priceRuleId) {
            if (upsale.priceRuleId) {
                if (upsale.discountId) {
                    try {
                        await res.shopify.discountCode.delete(
                            upsale.priceRuleId,
                            upsale.discountId
                        );
                    } catch (err) {
                        console.log("del discount err", err);
                    }
                }
                try {
                    await res.shopify.priceRule.delete(upsale.priceRuleId);
                } catch (err) {
                    console.log("del priceRule err", err);
                }
            }
            await upsale.update({
                ...payload,
                priceRuleId: null,
                discountId: null,
                discountCode: null,
                targets: JSON.stringify(payload.targets),
            });
        } else if (payload.discount !== upsale.discount) {
            await updateAllCollectionIdIfNecesary(payload, shopDB, res);

            let priceRule = null;
            let discountCode = {
                id: upsale.discountId,
                code: upsale.discountCode,
            };
            if (!upsale.priceRuleId) {
                const res = await createPriceRuleAndDiscount(
                    payload,
                    shopDB,
                    res
                );

                priceRule = res.priceRule;
                discountCode = res.discountCode;
            } else {
                const priceRuleParams = {
                    discount: payload.discount,
                    productId: upsale.gId.split("Product/")[1],
                    targets: payload.targets,
                    allProductsCollectionId: shopDB.allProductsCollectionId,
                };
                const priceRuleData = getPriceRuleData(priceRuleParams);

                priceRule = await res.shopify.priceRule.update(
                    upsale.priceRuleId,
                    priceRuleData
                );
            }

            await upsale.update({
                ...payload,
                targets: JSON.stringify(payload.targets),
                priceRuleId: priceRule.id,
                discountId: discountCode.id,
                discountCode: discountCode.code,
            });
        } else {
            await upsale.update({
                ...payload,
                targets: JSON.stringify(payload.targets),
            });
        }

        res.json(upsale);
    } catch (err) {
        console.log("update upsale err", err && err.messages);
        res.sendStatus(422);
    }
};

// Toggle a specific upsale active/unactive
const toggle = async (req, res) => {
    try {
        const { shop, accessToken } = res.locals.shopify.session;
        const { id } = req.params;
        const shopDB = await models.Shop.findOne({ where: { domain: shop } });

        if (!shopDB) res.sendStatus(404);

        const upsale = await models.Upsale.findOne({
            where: { id, shopId: shopDB.id },
        });

        if (!upsale) res.sendStatusthrow(404);

        await upsale.update({ isActive: !upsale.isActive });

        res.json(upsale);
    } catch (err) {
        console.log("toggle", err);
        res.sendStatus(422);
    }
};

// Update Upsell popup products positions
// This is for when they reorder them from their dashboard with the drag and drop
const positions = async (req, res) => {
    try {
        const { shop } = res.locals.shopify.session;
        const upsales = req.body;

        const shopDB = await models.Shop.findOne({ where: { domain: shop } });

        if (!shopDB) res.sendStatus(404);

        const response = await sequelize.query(`
            UPDATE upsales as u
                SET position = c.position
            FROM (values
                ${upsales
                    .map((u) => `('${u.id}'::uuid, ${u.position})`)
                    .join(", ")}
            ) as c(id, position)
            WHERE c.id = u.id;
        `);

        res.json(response);
    } catch (err) {
        console.log("positions up err", err);
        res.sendStatus(422);
    }
};

const get = async (req, res) => {
    try {
        const { shop, accessToken } = res.locals.shopify.session;
        const { id } = req.params;

        const shopDB = await models.Shop.findOne({
            where: { domain: shop },
        });

        if (!shopDB) res.sendStatus(404);

        const upsale = await models.Upsale.findOne({
            where: { id, shopId: shopDB.id },
            raw: true,
        });

        if (!upsale) res.sendStatus(404);

        const parsedUpsalesTargets = JSON.parse(upsale.targets);

        let targets = parsedUpsalesTargets;

        if (targets.length && !targets.includes("all")) {
            if (targets[0].id.includes("Product/")) {
                const response = await res.shopify.graphql(
                    listProducts(targets.map((t) => t.id))
                );
                targets = response.nodes
                    .filter((t) => !!t)
                    .map((t) => ({
                        ...t,
                        image: t.featuredImage
                            ? t.featuredImage.transformedSrc
                            : t.featuredImage,
                        variants: t.variants.edges.map((v) => v.node),
                        selectedVariants: parsedUpsalesTargets.find(
                            (t2) => t2.id === t.id
                        ).selectedVariants,
                    }));
            } else {
                const response = await res.shopify.graphql(
                    listCollections(targets.map((t) => t.id))
                );
                targets = response.nodes.filter((t) => !!t);
            }
        }

        let mainProductResponse = await res.shopify.graphql(
            listProducts([upsale.gId])
        );

        mainProductResponse =
            mainProductResponse &&
            mainProductResponse.nodes &&
            mainProductResponse.nodes[0];

        const variants = mainProductResponse
            ? mainProductResponse.variants.edges.map((v) => v.node)
            : [];

        res.json({
            ...upsale,
            image: mainProductResponse
                ? mainProductResponse.featuredImage
                    ? mainProductResponse.featuredImage.transformedSrc
                    : mainProductResponse.featuredImage
                : null,
            variants,
            targets,
        });
    } catch (err) {
        console.log("get upsale err", err);
        if (err.name === "CastError" || err.name === "NotFoundError") {
            res.sendStatus(404);
        }
        res.sendStatus(500);
    }
};

const list = async (req, res) => {
    try {
        const { shop, accessToken } = res.locals.shopify.session;

        const shopDB = await models.Shop.findOne({ where: { domain: shop } });

        if (!shopDB) res.sendStatus(404);

        let upsales = await models.Upsale.findAll({
            where: {
                shopId: shopDB.get("id"),
            },
            order: [["position", "ASC"]],
            raw: true,
        });

        if (!upsales || !upsales.length) return res.json([]);

        let productsWithVariants = await res.shopify.graphql(
            getProductsVariants(upsales.map((u) => u.gId))
        );

        if (productsWithVariants && productsWithVariants.nodes) {
            productsWithVariants = productsWithVariants.nodes
                .filter((p) => !!p)
                .map((p) => ({
                    ...p,
                    variants: p ? p.variants.edges.map((v) => v.node) : [],
                }));
        }

        upsales = await Promise.all(
            upsales.map(async (u) => {
                let targets = JSON.parse(u.targets);

                targets = await Promise.all(
                    targets.map(async (t) => {
                        const shopId = shopDB.get("id");
                        const handle = t.handle;
                        const id = t.id;

                        if (!id || !id.includes("Collection")) {
                            return t;
                        }

                        const collectionCountQuery = `
                            {
                                collectionByHandle(handle: "${handle}") {
                                productsCount
                                }
                            }
                            `;

                        try {
                            const collectionsResponse =
                                await res.shopify.graphql(collectionCountQuery);

                            t.products = 0;
                            if (
                                collectionsResponse.collectionByHandle != null
                            ) {
                                t.products =
                                    collectionsResponse.collectionByHandle.productsCount;
                            }
                        } catch (e) {
                            console.log(e);
                        }

                        return t;
                    })
                );

                let targetsCount = 0;

                targets.forEach((t) => {
                    if (t.products) {
                        targetsCount = t.products;

                        return;
                    }

                    targetsCount = targetsCount + 1;
                });

                u.targetsCount = targetsCount;

                return u;
            })
        );

        res.json(
            upsales.map((u) => {
                const product =
                    productsWithVariants &&
                    productsWithVariants.find((pv) => pv.id === u.gId);

                if (!product) {
                    return {
                        ...u,
                        targets: JSON.parse(u.targets),
                        variants: [],
                    };
                }

                const upsaleVariants = product.variants;
                return {
                    ...u,
                    image: product.featuredImage
                        ? product.featuredImage.transformedSrc
                        : product.featuredImage,
                    targets: JSON.parse(u.targets),
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
        );
    } catch (err) {
        console.log(err && err.message);

        res.sendStatus(500);
    }
};

const deleteMethod = async (req, res) => {
    try {
        const { shop, accessToken } = res.locals.shopify.session;
        const { id } = req.params;

        const shopDB = await models.Shop.findOne({ where: { domain: shop } });

        if (!shopDB) res.sendStatus(404);

        const upsale = await models.Upsale.findOne({
            where: { id, shopId: shopDB.id },
        });

        if (!upsale) res.sendStatus(404);

        // Delete the priceRule & discount linked to this upsale
        if (upsale.priceRuleId) {
            if (upsale.discountId) {
                try {
                    await res.shopify.discountCode.delete(
                        upsale.priceRuleId,
                        upsale.discountId
                    );
                } catch (err) {
                    console.log("del discountCode err", err);
                }
            }
            try {
                await res.shopify.priceRule.delete(upsale.priceRuleId);
            } catch (err) {
                console.log("del priceRule err", err);
            }
        }

        await upsale.destroy();

        res.send("");
    } catch (err) {
        console.log("delete upsell", err);
        res.sendStatus(500);
    }
};

export default {
    delete: deleteMethod,
    list,
    get,
    positions,
    toggle,
    update,
    create,
};
