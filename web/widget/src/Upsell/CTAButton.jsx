import React, { useState } from "react";

import { MoneyFormat } from "../components";
import { getDiscountedPrice } from "../helpers";

import Loader from "./Loader";

const CTAButton = ({
  isPreview,
  isLoading,
  handleCTA,
  settings,
  selected,
  items,
}) => {
  const [isFocused, setFocus] = useState(false);
  const [isHovered, setHover] = useState(false);

  const { hsl } =
    selected && selected.length ? settings.primaryColor : settings.noThxColor;

  let addedValue = 0;

  // If some upsales have been selected, add total price to "Continue" button
  if (!isPreview && selected && selected.length) {
    selected.forEach((s) => {
      const item = items.find((item) => item.id === s);
      let selectedVariant = null;
      if (item.selectedVariant) {
        selectedVariant = item.variants.find(
          (v) => v.id === item.selectedVariant
        );
      } else selectedVariant = item.variants[0];
      if (selectedVariant && selectedVariant.price) {
        const variantPrice = parseFloat(selectedVariant.price);
        addedValue +=
          item.discount && item.discount !== "0"
            ? parseFloat(getDiscountedPrice(variantPrice, item.discount))
            : variantPrice;
      }
    });
  }

  // Check if the artificial price is enabled Start
  let showArtificialPrice = false;
  if (!!items && items.length) {
    for (var z = 0; z < items.length; z++) {
      if (
        !!items[z].settings &&
        !!items[z].settings.hasOwnProperty('isArtificialPriceEnabled') &&
        !!items[z].settings.isArtificialPriceEnabled
      ) {
        showArtificialPrice = true;
        break;
      }
    }
  }
  // Check if the artificial price is enabled END

  return (
    <button
      type="button"
      onMouseEnter={() => setHover(!isHovered)}
      onMouseLeave={() => setHover(!isHovered)}
      onFocus={() => setFocus(!isFocused)}
      onBlur={() => setFocus(!isFocused)}
      onClick={handleCTA}
      className={`inline-flex justify-center w-full border px-3 py-8 text-base leading-6 font-medium text-white shadow-sm focus:outline-none transition ease-in-out duration-150 sm:text-sm sm:leading-5 h-12 items-center tracking-wide`}
      style={{
        backgroundColor: `hsla(
            ${hsl.hue}, ${hsl.saturation * 100}%, ${hsl.brightness * 100}%,
            ${isHovered && !isFocused ? 0.8 : 1}
          )`,
        borderColor: isFocused
          ? `hsla(
          ${hsl.hue}, ${hsl.saturation * 100}%, ${
              (hsl.brightness - 0.12) * 100
            }%,
          1
        )`
          : "transparent",
        ...(isFocused
          ? {
              boxShadow: `0 0 0 3px hsla(${hsl.hue}, ${
                hsl.saturation * 100
              }%, ${(hsl.brightness + 0.2) * 100}%, 0.45)`,
            }
          : {}),
      }}
    >
      {isLoading ? (
        <Loader />
      ) : selected && selected.length ? (
        <span>
          {settings.ctaText}
          {
            !showArtificialPrice &&
            (settings.hasOwnProperty('isCtaPriceActive') && !!settings.isCtaPriceActive) &&
            addedValue > 0 &&
            (
              <span>
                {" "}
                (+
                <MoneyFormat amount={addedValue.toFixed(2).toString()} />)
              </span>
            )
          }
        </span>
      ) : (
        settings.noThxText
      )}
    </button>
  );
};

export default CTAButton;
