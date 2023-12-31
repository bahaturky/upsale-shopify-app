import React from "react";

// eslint-disable-next-line no-template-curly-in-string
const DEFAULT_MONEY_FORMAT = "${{amount}}";

function formatMoney(cents, format, round) {
  if (typeof cents == "string") {
    cents = cents.replace(".", "");
  }
  var value = "";
  var placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
  var formatString = format || DEFAULT_MONEY_FORMAT;

  function defaultOption(opt, def) {
    return typeof opt == "undefined" ? def : opt;
  }

  function formatWithDelimiters(number, precision, thousands, decimal) {
    precision = round ? 0 : defaultOption(precision, 2);
    thousands = defaultOption(thousands, ",");
    decimal = defaultOption(decimal, ".");

    if (isNaN(number) || number == null) {
      return 0;
    }

    number = (number / 100.0).toFixed(precision);

    var parts = number.split("."),
      dollars = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1" + thousands),
      cents = parts[1] ? decimal + parts[1] : "";

    return dollars + cents;
  }

  // eslint-disable-next-line default-case
  switch (formatString.match(placeholderRegex)[1]) {
    case "amount":
      value = formatWithDelimiters(cents, 2);
      break;
    case "amount_no_decimals":
      value = formatWithDelimiters(cents, 0);
      break;
    case "amount_with_comma_separator":
      value = formatWithDelimiters(cents, 2, ".", ",");
      break;
    case "amount_no_decimals_with_comma_separator":
      value = formatWithDelimiters(cents, 0, ".", ",");
      break;
    case "amount_with_apostrophe_separator":
      value = formatWithDelimiters(cents, 2, "'", ".");
      break;
  }

  return formatString.replace(placeholderRegex, value);
}

const MoneyFormat = ({ amount, round, moneyFormat, settings }) => {
  const limitedAmount = amount < 0 ? 0 : amount;

  if (
    parseFloat(limitedAmount) === 0 &&
    settings &&
    !!settings.freeProductText
  ) {
    return <span>{settings.freeProductText}</span>;
  }

  return (
    <span
      dangerouslySetInnerHTML={{
        __html: formatMoney(
          limitedAmount,
          (window &&
            ((window.theme && window.theme.moneyFormat) ||
            (window.Shopify &&
              window.Shopify.shop.settings &&
              window.Shopify.shop.settings.money_format))) ||
            (window.islandUpsell && window.islandUpsell.shop.moneyFormat) ||
            moneyFormat ||
            null,
          round
        ),
      }}
    />
  );
};

export default MoneyFormat;
