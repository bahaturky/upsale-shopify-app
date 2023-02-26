import React, { useState, useEffect } from "react";

import { MoneyFormat } from "../components";
import { getDiscountedPrice } from "../helpers";

const FreeShippingBar = ({
  settings,
  selected,
  isPreview,
  items,
}) => {
  const [cart, setCart] = useState(null);

  let addedValue = 0;
  let remainingAmount = settings.freeShippingBarAmount
  let progress = 0

  useEffect(() => { 
    async function fetchCart() {
      try {
        const req = await fetch('/cart.js');
        const res = await req.json();

        setCart(res);
      } catch (err) {
        console.log(err);
      }
    }
    fetchCart();
  }, []);

  if (cart) {
    const { total_price } = cart;

    addedValue = parseFloat(total_price / 100);
  }

  // If some upsales have been selected, compute total price
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

  remainingAmount = settings.freeShippingBarAmount - addedValue;

  // TODO found a better solution to handle 0.000 case
  if (
    remainingAmount > 0 &&
    remainingAmount < 0.5
  ) {
    remainingAmount = 1
  }

  progress = Math.floor((100 * addedValue) / settings.freeShippingBarAmount);

  if (progress > 100) {
    progress = 100;
  }

  const textProgress = settings.freeShippingBarTextProgress.split(/{amount}|{AMOUNT}/);

  const inProgress = remainingAmount > 0;

  return (
    <div
      className={`w-full py-3 px-4 text-xs text-black`}
      style={{
        backgroundColor: settings.shippingBarColor.hex
      }}
    >
      {inProgress ? (
        <div>
          {textProgress[1] ? (
            <div>
              <span>{textProgress[0]}</span>
              <span className="font-bold"><MoneyFormat amount={parseInt(remainingAmount).toFixed(2).toString()} /></span>
              <span>{textProgress[1]}</span>
            </div>
          ) : (
            <div>
              <span>{textProgress[0]}</span>
            </div>
          )}
        </div>
      ) : (
        <div>
          <span>{settings.freeShippingBarTextSucess}</span>
        </div>
      )}
      <div
        className="progress-bar bg-white mt-2"
        style={{
          width: '100%',
          height: '6px'
        }}
      >
        <div
          className="progress-bar-inner"
          style={{
            backgroundColor: settings.primaryColor.hex,
            width: `${progress}%`,
            height: '6px'
          }}
        />
      </div>
    </div>
  );
};

export default FreeShippingBar;
