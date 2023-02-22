import storage from "../storage";
import React from "react";

const CurrencyContext = React.createContext();

function getCurrency() {
  // https://apps.shopify.com/doubly-currency-converter
  const doublyCurrency =
    window.DoublyGlobalCurrency && window.DoublyGlobalCurrency.currentCurrency;
  if (doublyCurrency && doublyCurrency.length === 3) {
    return doublyCurrency;
  }

  // https://apps.shopify.com/currency-switcher
  const scmCurrency =
    window.SECOMAPP &&
    typeof window.SECOMAPP.cookie === "function" &&
    window.SECOMAPP.cookie("scm_currency_2");
  if (scmCurrency && scmCurrency.length === 3) {
    return scmCurrency;
  }

  // https://apps.shopify.com/multi-currency
  const boldCurrency =
    window.BOLDCURRENCY && window.BOLDCURRENCY.currentCurrency;
  if (boldCurrency && boldCurrency.length === 3) {
    return boldCurrency;
  }

  // https://apps.shopify.com/coin
  const coinCurrency =
    window.Shoppad &&
    window.Shoppad.apps &&
    window.Shoppad.apps.coin &&
    typeof window.Shoppad.apps.coin.getLocalCurrency === "function" &&
    window.Shoppad.apps.coin.getLocalCurrency();
  if (coinCurrency && coinCurrency.length === 3) {
    return coinCurrency;
  }

  // https://apps.shopify.com/vitals
  const vitalsCurrency = storage.getItem("local_currency");
  if (vitalsCurrency && vitalsCurrency.length === 3) {
    return vitalsCurrency;
  }

  // https://apps.shopify.com/currency-converter-master
  try {
    const autoketingCurrency = JSON.parse(
      storage.getItem("autoketing-currency-location-customer-v1")
    );

    if (autoketingCurrency && autoketingCurrency.length === 3) {
      return autoketingCurrency;
    }
  } finally {
    //
  }

  // https://withreach.com/
  const reachCurrency = storage.getItem("GIP_USER_CURRENCY");
  if (reachCurrency && reachCurrency.length === 3) {
    return reachCurrency;
  }

  // Theme at new-pod.myshopify.com
  const localStoreCurrency = storage.getItem("currency");
  if (localStoreCurrency && localStoreCurrency.length === 3) {
    return localStoreCurrency;
  }

  const currencyJs = window.Currency && window.Currency.currentCurrency;
  if (currencyJs && currencyJs.length === 3) {
    return currencyJs;
  }

  return window.Shopify ? window.Shopify.currency.active : null;
}

export const CurrencyContextProvider = ({ children, currency }) => (
  <CurrencyContext.Provider
    value={{
      currency: getCurrency() || currency || "USD",
    }}
  >
    {children}
  </CurrencyContext.Provider>
);

export default CurrencyContext;
