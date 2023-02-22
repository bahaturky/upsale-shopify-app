import { Op } from "sequelize";

import models from "../../models/index.js";

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}

const track = async (req, res) => {
    try {
        // const { shop, accessToken } = res.locals.shopify.session;
        const { shop, event, data } = req.body;

        const shopDB = await models.Shop.findOne({ where: { id: shop.id } });

        if (!shopDB) res.sendStatus(404);

        const timeNow = new Date(Date.now() - 24 * 60 * 60 * 1000);

        await asyncForEach(data, async ({ upsaleId, price }) => {
            try {
                const analytic = await models.Analytic.findOne({
                    where: {
                        shopId: shop.id,
                        upsaleId,
                        createdAt: {
                            [Op.gt]: timeNow,
                        },
                    },
                });

                if (analytic) {
                    await analytic.update({
                        [`${event}s`]: analytic[`${event}s`] + 1,
                        ...(event === "transaction"
                            ? { totalValue: analytic.totalValue + price }
                            : {}),
                    });
                    return analytic;
                }

                const newAnalytic = await models.Analytic.create({
                    shopId: shop.id,
                    upsaleId,
                    [`${event}s`]: 1,
                    ...(event === "transaction" ? { totalValue: price } : {}),
                });

                return newAnalytic;
            } catch (err) {
                console.log(err.message || err);
            }
        });

        if (event === "view") {
            const modalView = await models.ModalView.findOne({
                where: {
                    shopId: shop.id,
                    createdAt: {
                        [Op.gt]: timeNow,
                    },
                },
            });

            if (modalView) {
                await modalView.update({
                    views: modalView.views + 1,
                });
            } else {
                await models.ModalView.create({
                    shopId: shop.id,
                    views: 1,
                });
            }
        }

        // send congrats emails if user crossed 10 sales or 200$ of sales
        if (event === "transaction") {
            if (shopDB && !shopDB.passedXSales) {
                const analytics = await models.Analytic.findAll({
                    where: {
                        shopId: shop.id,
                    },
                    raw: true,
                });

                const r = analytics.reduce(
                    (acc, { transactions, totalValue }) => [
                        acc[0] + transactions,
                        acc[1] + totalValue,
                    ],
                    [0, 0]
                );

                if (r[0] >= 10 || r[1] >= 200) {
                    await shopDB.update({ passedXSales: true });
                }
            }
        }

        res.send("ok");
    } catch (err) {
        console.log("track error", err);
        if (err.name === "CastError" || err.name === "NotFoundError") {
            res.sendStatus(404);
        }
        res.sendStatus(422);
    }
};

const list = async (req, res) => {
    try {
        // const { id } = ctx.params;
        const { id } = req.params;
        const { days } = req.query;

        const shopDB = await models.Shop.findOne({ where: { id } });

        if (!shopDB) res.sendStatus(404);

        const since = !!days
            ? {
                  createdAt: {
                      [Op.gt]: new Date(
                          Date.now() - days * 24 * 60 * 60 * 1000
                      ),
                  },
              }
            : {};

        const analytics = await models.Analytic.findAll({
            where: {
                shopId: id,
                ...since,
            },
        });

        if (!analytics) return (ctx.body = []);

        const modalViews = await models.ModalView.findAll({
            where: {
                shopId: id,
                ...since,
            },
        });

        ctx.body = { analytics, modalViews };
    } catch (err) {
        console.log("list analytics", err);
        if (err.name === "CastError" || err.name === "NotFoundError") {
            res.sendStatus(404);
        }
        res.sendStatus(422);
    }
};

export default {
    track,
    list,
};
