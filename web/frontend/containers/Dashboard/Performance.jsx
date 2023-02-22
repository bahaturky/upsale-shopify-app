import { useState, useEffect } from "react";
import { Button, Select, Heading } from "@shopify/polaris";
// import axios from "../../axios";

import { SalesSummaryCards } from "../../components";
import { useAuthenticatedFetch } from "../../hooks";

const metrics = (t) => [
    { label: t("sales"), name: "ordersValue" },
    { label: t("conversion"), name: "conversionRate" },
    { label: t("views"), name: "views" },
    { label: t("roi"), name: "roi" },
];

const tabs = (t) => [
    {
        id: "total",
        content: t("all-time"),
        days: null,
    },
    {
        id: "today",
        content: t("last-hours", { n: 24 }),
        days: 1,
    },
    {
        id: "7days",
        content: t("last-days", { n: 7 }),
        days: 7,
    },
    {
        id: "30days",
        content: t("last-days", { n: 30 }),
        days: 30,
    },
    {
        id: "3months",
        content: t("last-months", { n: 3 }),
        days: 90,
    },
];

const formatData = (data) => {
    const r = data.analytics.reduce(
        (acc, { views, addToCarts, transactions, totalValue }) => [
            acc[0] + totalValue,
            acc[1] + views,
            acc[2] + addToCarts,
            acc[3] + transactions,
        ],
        [0, 0, 0, 0]
    );

    const transactionsCount = r[3];

    const views = data.modalViews.reduce((acc, { views }) => acc + views, 0);

    r[1] = views;

    r.splice(1, 0, !!r[1] && !!r[3] ? r[3] / r[1] : 0);

    r[1] = [r[1], transactionsCount];

    return r;
};

const Performance = ({ food, shop, t, toggleApp }) => {
    const [data, setData] = useState(null);
    const [selectedTab, setSelectedTab] = useState(0);
    const [isLoading, setLoading] = useState(true);
    const fetch = useAuthenticatedFetch();
    const options = tabs(t).map((tab, index) => ({
        label: tab.content,
        value: index,
    }));

    useEffect(() => {
        if (food) setData(formatData(food));
        else setData([0, 0, 0, 0, 0]);
        setLoading(false);
    }, [food]);

    const onSelectTab = async (index) => {
        try {
            setSelectedTab(index);
            setLoading(true);
            const res = (
                await fetch(
                    `${HOST}/api/shop/${shop.id}/food${
                        index !== 0 ? `?days=${tabs(t)[index].days}` : ""
                    }`
                )
            ).data;

            if (res) setData(formatData(res));
            else setData([0, 0, 0, 0, 0]);

            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="analytics-header flex justify-between items-center mb-6">
                <Heading>{t("analytics-summary")}</Heading>
                <Select
                    options={options}
                    onChange={onSelectTab}
                    value={options[selectedTab].value}
                />
            </div>
            <div className="analytics-tab md:flex md:justify-between">
                <SalesSummaryCards
                    metrics={metrics(t)}
                    data={data}
                    onMetricChange={null}
                    isLoading={isLoading}
                    moneyFormat={shop.moneyFormat}
                />
                <div
                    className={`enable-toggle relative flex-1 mt-6 md:mt-0 py-6 h-40 rounded md:ml-4 flex flex-col items-center
            ${shop.isAppEnabled ? "bg-blue-100" : "bg-red-100"}
          `}
                >
                    <div className="status mb-3 flex items-center font-semibold">
                        <div
                            style={{
                                backgroundColor: shop.isAppEnabled
                                    ? "blue"
                                    : "red",
                                borderRadius: "100%",
                                width: "8px",
                                height: "8px",
                                marginRight: "1rem",
                            }}
                        />
                        {shop.isAppEnabled ? "App enabled" : "App disabled"}
                    </div>
                    <Button onClick={toggleApp} primary>
                        {shop.isAppEnabled
                            ? "Disable the app"
                            : "Enable the app"}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Performance;
