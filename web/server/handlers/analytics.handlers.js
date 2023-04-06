import { Op } from "sequelize";

import models from "../../models/index.js";

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}

const track = async (req, res) => {
    try {
        const { shop, event, data } = req.body;

        // Check that the request contains a valid shop ID
        if (!shop || !shop.id) {
            return res.status(422).send("Invalid request");
        }

        // Load the shop from the database
        const shopDB = await models.Shop.findOne({ where: { id: shop.id } });

        // Return 404 if the shop could not be found
        if (!shopDB) {
            return res.sendStatus(404);
        }

        const timeNow = new Date(Date.now() - 24 * 60 * 60 * 1000);

        // Process each item in the data array
        await Promise.all(data.map(async ({ upsaleId, price }) => {
            try {
                const analytic = await models.Analytic.findOne({
                    where: {
                        shopId: shop.id,
                        upsaleId,
                        createdAt: {
                            [Op.gt]: timeNow
                        }
                    }
                });

                if (analytic) {
                    // Increment existing analytic record
                    await analytic.increment(`${event}s`, { by: 1 });
                    if (event === "transaction") {
                        await analytic.increment("totalValue", { by: price });
                    }
                    return;
                }

                // Create a new analytic record
                const newAnalytic = await models.Analytic.create({
                    shopId: shop.id,
                    upsaleId,
                    [`${event}s`]: 1
                });
                if (event === "transaction") {
                    newAnalytic.totalValue = price;
                }
                await newAnalytic.save();
            } catch (err) {
                console.log(err.message || err);
            }
        }));

        // Update modal view count if applicable
        if (event === "view") {
            const modalView = await models.ModalView.findOne({
                where: {
                    shopId: shop.id,
                    createdAt: {
                        [Op.gt]: timeNow
                    }
                }
            });

            if (modalView) {
                await modalView.increment("views", { by: 1 });
            } else {
                await models.ModalView.create({
                    shopId: shop.id,
                    views: 1
                });
            }
        }

        // Send congrats email if user reaches milestone
        if (event === "transaction") {
            if (!shopDB.passedXSales) {
                const analytics = await models.Analytic.findAll({
                    where: {
                        shopId: shop.id
                    },
                    raw: true
                });

                const [transactions, totalValue] = analytics.reduce(
                    ([accT, accV], { transactions, totalValue }) => [
                        accT + transactions,
                        accV + totalValue
                    ],
                    [0, 0]
                );

                if (transactions >= 10 || totalValue >= 200) {
                    await sendCongratsEmail(shopDB.email);
                    await shopDB.update({ passedXSales: true });
                }
            }
        }

        res.send("ok");
    } catch (err) {
        console.log("track error", err);
        res.sendStatus(422);
    }
};

// A function to send a congratulatory email
async function sendCongratsEmail(email) {
    // TODO: Implement email sending logic here
}


const list = async (req, res) => {
    try {
        const { id } = req.params;
        const { days } = req.query;

        // Load the shop from the database
        const shopDB = await models.Shop.findOne({ where: { id } });

        // Return 404 if the shop could not be found
        if (!shopDB) {
            return res.sendStatus(404);
        }

        const since = !!days
            ? {
                createdAt: {
                    [Op.gt]: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
                },
            }
            : {};

        // Load analytics records for the specified shop and time range
        const analytics = await models.Analytic.findAll({
            where: {
                shopId: id,
                ...since,
            },
        });

        // Load modal view records for the specified shop and time range
        const modalViews = await models.ModalView.findAll({
            where: {
                shopId: id,
                ...since,
            },
        });

        // Merge analytics and modal views into a single response object
        res.json({ analytics, modalViews });
    } catch (err) {
        console.log("list analytics", err);
        res.sendStatus(422);
    }
};

export default {
    track,
    list,
};
