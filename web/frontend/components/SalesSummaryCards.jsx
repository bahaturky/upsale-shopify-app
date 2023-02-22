import { SkeletonDisplayText } from "@shopify/polaris";

import MoneyFormat from "../widget/src/components/MoneyFormat";

const Metric = ({
    title,
    loading,
    children,
    metric,
    currentMetric,
    onMetricChange,
    top,
}) => (
    <div
        className={`relative px-6 py-6 flex flex-col flex-grow-well min-w-56 h-40 bg-white rounded ${
            metric === "ordersValue" ? "border-t-4 border-yellow-300" : ""
        } justify-center md:max-w-sm`}
        onClick={currentMetric ? () => onMetricChange(metric) : () => {}}
    >
        {/* top && (
      <div className="absolute top-0 right-0 m-4 uppercase">
        <span className="pl-0.5 flex justify-center items-center pr-2 py-0.5 rounded-full text-sm font-extrabold leading-4 bg-indigo-100 text-indigo-500">
          <svg
            className="w-5 h-3 mr-1 text-indigo-500"
            fill="currentColor"
            viewBox="0 0 8 8"
          >
            <circle cx="4" cy="4" r="3" />
          </svg>
          top {top}%
        </span>
      </div>
    )*/}
        <div className="mb-3 text-md font-bold tracking-wider text-cool-gray-500">
            {title}
        </div>
        <div className="text-3xl font-black tracking-wider">
            {loading ? <SkeletonDisplayText /> : children}
        </div>
    </div>
);

const NumberFormat = ({ number }) => {
    if (isNaN(number)) return null;
    return number;
};

const ConversionRate = ({ number }) => `${Math.round(number * 100)}%`;

const SalesSummaryCards = ({
    metrics,
    data,
    metric,
    onMetricChange,
    isLoading,
    moneyFormat,
}) => (
    <div className="md:grid md:grid-cols-4 md:gap-4">
        {metrics.map(({ label, name }, i) => {
            let top = null;

            const val = !isLoading
                ? Array.isArray(data[i])
                    ? data[i][0]
                    : data[i]
                : null;

            if (name === "conversionRate" && val) {
                if (val > 0.01 && val <= 0.05) top = 50;
                if (val > 0.05 && val <= 0.1) top = 25;
                if (val > 0.1 && val <= 0.2) top = 10;
                if (val > 0.2) top = 5;
            }

            return (
                <Metric
                    key={name}
                    title={label}
                    loading={isLoading}
                    metric={name}
                    currentMetric={metric}
                    onMetricChange={onMetricChange}
                    top={top}
                >
                    {!isLoading &&
                        (name === "conversionRate" ? (
                            <div className="flex items-baseline">
                                <div>
                                    <ConversionRate number={val} />
                                </div>
                                <div className="meta text-lg ml-auto font-normal text-gray-800">
                                    ∼<NumberFormat number={data[i][1]} /> sales
                                </div>
                            </div>
                        ) : name === "ordersValue" ? (
                            <MoneyFormat
                                amount={val.toFixed(2).toString()}
                                round={true}
                                moneyFormat={moneyFormat}
                            />
                        ) : name === "roi" ? (
                            <div className="flex items-baseline">
                                <div>∞</div>
                                <div className="meta text-lg ml-auto font-normal text-gray-800">
                                    Free plan
                                </div>
                            </div>
                        ) : (
                            <NumberFormat number={val} />
                        ))}
                </Metric>
            );
        })}
        <style jsx>{`
            div :global(.flex-grow-well) {
                flex: 1 1 16rem;
            }
        `}</style>
    </div>
);

export default SalesSummaryCards;
