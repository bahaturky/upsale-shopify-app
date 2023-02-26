import React from "react";

import { Skeleton, MoneyFormat } from ".";
import { getDiscountedPrice } from "../helpers";
import useUpsaleDiscount from "../hooks/useUpsaleDiscount";

const ItemPrice = ({ item, settings, alignment = "right", size = "md" }) => {
  const { discount } = useUpsaleDiscount(item?.customDiscountCode ? item.id : null);
  const hasVariants = !!(item && item.variants && item.variants.length);
  const variant = hasVariants
    ? item?.selectedVariant
      ? item?.variants?.find((v) => v.id === item.selectedVariant)
      : item?.variants?.[0]
    : null;

  //
  let PricesHtml = () => {
    return (
      <>
        <div>
          <MoneyFormat amount={variant.price} settings={settings} />
        </div>
        {
          ( !!item && item.hasOwnProperty('settings') && !!item.settings ) &&
          ( item.settings.hasOwnProperty('showCompareAtPrice') && !!item.settings.showCompareAtPrice ) &&
          ( variant.hasOwnProperty('compareAtPrice') && !!variant.compareAtPrice ) &&
          <div className="mr-1 flex items-center font-normal text-gray-400 line-through sm:ml-2 text-2xs">
            <MoneyFormat amount={variant.compareAtPrice} />
          </div>
        }
      </>
    );
  };

  if (
    ( !!item && item.hasOwnProperty('settings') && !!item.settings ) &&
    ( item.settings.hasOwnProperty('isArtificialPriceEnabled') && !!item.settings.isArtificialPriceEnabled ) &&
    ( item.settings.hasOwnProperty('artificialPrice') && !!item.settings.artificialPrice )
  ) {
    PricesHtml = () => {
      return (
        <>
          <div>
            <MoneyFormat amount={item.settings.artificialPrice} />
          </div>
          {
            (
              item.settings.hasOwnProperty('isArtificialCompareAtPriceEnabled') &&
              !!item.settings.isArtificialCompareAtPriceEnabled &&
              item.settings.hasOwnProperty('artificialCompareAtPrice') &&
              !!item.settings.artificialCompareAtPrice
            ) &&
            <div className="mr-1 flex items-center font-normal text-gray-400 line-through sm:ml-2 text-2xs">
              <MoneyFormat amount={item.settings.artificialCompareAtPrice} />
            </div>
          }
        </>
      );
    }
  } else if ( !!item && ( item.customDiscountCode && discount ) || item?.discount > 0 ) {
    PricesHtml = () => {
      return (
        <>
          <div>
            <MoneyFormat amount={getDiscountedPrice(variant.price, item.customDiscountCode ? discount : item.discount)} settings={settings} />
          </div>
          <div className="mr-1 flex items-center font-normal text-gray-400 line-through sm:ml-2 text-2xs">
            <MoneyFormat amount={variant.price} />
          </div>
        </>
      );
    }
  }
  //

  return (
    <div
      className={`flex text-gray-800 tracking-wide flex-shrink-0 font-medium mr-1
          ${!item ? "w-1/3 sm:w-1/4" : ""}
          ${alignment === "center" ? "justify-center" : ""}
          ${size === "xs" ? "text-xs xs:text-xs sm:text-xs" : "text-xl"}
        `}
      style={{ color: settings.secondaryColor.hex }}
    >
      {
        item && variant ?
        <PricesHtml /> : settings.showPreviewPrice ?
        (
          <div>
            <MoneyFormat amount="29.99" settings={settings} />
          </div>
        ) : (
          <div className="w-full">
            <Skeleton />
          </div>
        )
      }
    </div>
  );
};

export default ItemPrice;
