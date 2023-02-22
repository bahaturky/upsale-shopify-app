import React, { useState, useEffect, useMemo } from "react";
import Countdown, { zeroPad } from "react-countdown";

import CTAButton from "./CTAButton";
import FreeShippingBar from "./FreeShippingBar";
import MainSelectedProduct from "./MainSelectedProduct";
import UpsaleItem from "./UpsaleItem";
import IconsBar from "./IconsBar";
import storage from "../storage";
import { parseJson, ajaxApiRequestConfig } from "../helpers";
import { CurrencyContextProvider } from "../components/CurrencyContext";
import useMaximumUpsellItemsCount from "../hooks/useMaximumUpsellItemsCount";
import ExpandedUpsaleProvider from "../providers/ExpandedUpsaleProvider";

const Index = ({ handleClose, settings, isPreview, upsales, currency, verified, tracker }) => {
  const isProd = process.env.NODE_ENV === "production";
  const [isLoading, setLoading] = useState(false);
  const [selected, setSelected] = useState(
    []
    // isPreview && upsales && upsales.length ? [upsales[0].id] : [] // For local development
  );
  const [countdown] = useState(Date.now() + settings.timerDuration * 1000 * 60);
  const [product, setProduct] = useState(
    isProd || isPreview ? null : require("../assets/product.json") // test data
  );
  const [isProductLoading, setProductLoading] = useState(!isPreview);
  const [items, setItems] = useState(upsales);
  const maximumUpsellItemsCount = useMaximumUpsellItemsCount(settings);

  useEffect(() => {
    setItems((oldItems) =>
      upsales.map((u) => {
        const found = oldItems.find((item) => item.id === u.id);
        return found ? { ...u, selectedVariant: found.selectedVariant } : u;
      })
    );

    if (settings.selectedPerDefault) {
      setSelected(
        (maximumUpsellItemsCount ? upsales.slice(0, maximumUpsellItemsCount) : upsales).map((upsale) => upsale.id)
      );
    }
  }, [upsales, maximumUpsellItemsCount]);

  if (!isPreview && settings.displayProduct && !product) {
    // Get product information with pathname
    parseJson(
      window.fetch(`${window.location.pathname}.json`, {
        ...ajaxApiRequestConfig("GET"),
      })
    )
      .then((res) => {
        if (res && res.product) setProduct(res.product);
        setProductLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setProductLoading(false);
      });
  }

  const selectUpsale = (id) => {
    setSelected((state) => {
      const newState = state.includes(id) ? state.filter((s) => s !== id) : state.concat(id);

      return newState.slice(-maximumUpsellItemsCount);
    });
  };

  // When user click "Continue" or "No Thanks"
  const handleCTA = async () => {
    try {
      setLoading(true);

      window.isIslandTrueUpsell = false;

      // If he selected some upsales, add them to cart and to our analytics
      if (selected && selected.length) {

        let variantsToAdd = [];
        let variantsWithProductToAdd = [];
        let trackData = [];
        let discountedItems = [];
        selected.forEach((s) => {
          const item = items.find((item) => item.id === s);
          let variantToAddFormatted = null;
          if (item.selectedVariant) {
            variantToAddFormatted = item.variants
              .find((v) => v.id === item.selectedVariant)
              .id.split("ProductVariant/")[1];
          } else {
            variantToAddFormatted = item.variants[0].id.split("ProductVariant/")[1];
          }
          variantsToAdd.push(variantToAddFormatted);

          //
          variantsWithProductToAdd.push({
            variant_id: variantToAddFormatted,
            product_id: item.gId.replace('gid://shopify/Product/', '')
          })
          //

          if (item.customDiscountCode || item.discount && item.discount > 0) {
            discountedItems.push({
              variantId: variantToAddFormatted,
              discount: item.customDiscountCode ? null : item.discount,
              code: item.customDiscountCode || item.discountCode,
              customCode: item.customDiscountCode
            });
          }
          trackData.push({ upsaleId: s, variantId: variantToAddFormatted });

          if ( item.isTrueUpsell ) {
            window.isIslandTrueUpsell = true;
          }

        });

        let products = storage.getItem("island-products");

        if (products) {
          products = JSON.parse(products);
        } else {
          products = [];
        }

        products = [...products, ...selected];

        storage.setItem("island-products", JSON.stringify(products));

        let discountedProducts = storage.getItem("island-discounted-products");

        // If some of the selected upsales are discounted, add info to localStorage for later use
        if (discountedItems.length > 0) {
          const discountCode = discountedItems[discountedItems.length - 1].code;
          if (discountCode) {
            storage.setItem("island-discount", discountCode);
          }

          const filteredDiscountedProducts = [
            ...(discountedProducts ? JSON.parse(discountedProducts) : []),
            ...discountedItems,
          ].filter((v, i, a) => a.findIndex((t) => t.variantId === v.variantId) === i);

          storage.setItem("island-discounted-products", JSON.stringify(filteredDiscountedProducts));
        }

        // Add upsales to cart
        if (window.meta.page.pageType === "collection") {
          await window.fetch("/cart/add.js", {
            ...ajaxApiRequestConfig("POST"),
            body: JSON.stringify({
              items: variantsWithProductToAdd.map((v) => {
                console.log('v', v);
                return {
                  id: v.variant_id,
                  quantity: 1,
                  properties: { _island_upsell_initial_product_id: v.product_id },
                }
              }),
            }),
          });
        } else {
          await window.fetch("/cart/add.js", {
            ...ajaxApiRequestConfig("POST"),
            body: JSON.stringify({
              items: variantsToAdd.map((v) => ({
                id: v,
                quantity: 1,
                properties: { _island_upsell_initial_product_id: window.meta.product.id },
              })),
            }),
          });
        }

        if (tracker && trackData.length) tracker.trackAddToCart(trackData);
      }

      setLoading(false);

      handleClose();
    } catch (err) {
      console.log("submit error", err);
    }
  };

  const selectVariant = (item, value) => {
    setItems((items) => items.map((u) => (u.id === item.id ? { ...u, selectedVariant: value } : u)));
  };

  const design = settings.design || "aaa";

  return (
    <div className="flex flex-col h-full min-h-0 overflow-y-hidden">
      {settings.isTimerActive && (
        <Countdown
          date={countdown}
          renderer={({ minutes, seconds, completed }) => {
            if (completed) return null;
            return (
              <div
                className="w-full p-4 text-sm text-center text-black urgency-bar"
                style={{
                  backgroundColor: settings.timerColor.hex,
                  lineHeight: "20px",
                }}
              >
                {settings.timerText} {minutes}:{zeroPad(seconds)}
              </div>
            );
          }}
        />
      )}
      {!isPreview && (
        <div onClick={handleClose} className="absolute top-0 right-0 m-4">
          <button className="inline-flex text-gray-400 transition duration-150 ease-in-out focus:outline-none focus:text-gray-500">
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      )}
      <CurrencyContextProvider currency={currency}>
        <div className="h-full px-2 py-2 pb-6 overflow-y-scroll upsells">
          <ExpandedUpsaleProvider {...{ settings, selected, selectUpsale, selectVariant, items }}>
            <h3 className="px-8 pt-6 pb-2 text-2xl font-normal leading-8 text-center text-gray-800 popup-title xs:px-10 xs:py-4 md:text-2xl md:leading-10">
              {settings.titleText}
            </h3>
            <div
              className={`upsells-list
               ${design === "ddd" ? "grid grid-cols-2 gap-2" : ""}
               ${design === "eee" ? "grid grid-cols-3 gap-2" : ""}
            `}
            >
              {settings.displayProduct && isProductLoading && (
                <div className="flex flex-col items-center justify-center w-full h-24">
                  <div className="w-24 h-24 spinner"></div>
                </div>
              )}
              {settings.displayProduct && (isPreview || (product && product.image && !isProductLoading)) && (
                <MainSelectedProduct product={product} settings={settings} selected={selected} isPreview={isPreview} />
              )}
              {items.map((u, i) => {
                const isSelected = selected.includes(u.id);

                return (
                  <UpsaleItem
                    i={i}
                    key={u.id}
                    item={u.title ? u : null}
                    settings={settings}
                    handleSelect={() => selectUpsale(u.id)}
                    {...{ isSelected, selectVariant }}
                  />
                );
              })}
            </div>
          </ExpandedUpsaleProvider>
          {!verified && (
            <div className="mt-6">
              <a href="https://apps.shopify.com/island-upsell" target="_blank">
                <img
                  style={{
                    width: "150px",
                    margin: "0 auto",
                  }}
                  src="https://live.islandapps.co/logo.svg"
                  alt="logo"
                />
              </a>
            </div>
          )}
        </div>
      </CurrencyContextProvider>
      <div className="bottom-0 left-0 w-full cta-btn">
        {settings.isFreeShippingBarActive && (
          <FreeShippingBar settings={settings} selected={selected} isPreview={isPreview} items={items} />
        )}
        {settings.isIconsBarActive && <IconsBar settings={settings} />}
        <CTAButton
          isLoading={isLoading}
          handleCTA={isPreview ? null : handleCTA}
          settings={settings}
          selected={selected}
          items={items}
          isPreview={isPreview}
        />
      </div>
    </div>
  );
};

export default Index;
