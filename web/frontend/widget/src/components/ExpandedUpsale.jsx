import React, { memo, useContext, useMemo } from "react";
import { SelectVariant, ItemPrice, CartBtn } from ".";
import ExpandedUpsaleContext from "../contexts/ExpandUpsaleContext";
import useUpsaleProduct from "../hooks/useUpsaleProduct";
import Skeleton from "./Skeleton";

const shapeToClass = {
  square: "",
  halfRounded: "rounded-md",
  rounded: "rounded-full",
};

const ExpandedUpsale = memo(function ExpandedUpsale({ upsale, settings, selected, selectUpsale, selectVariant }) {
  const setExpandedUpsale = useContext(ExpandedUpsaleContext);
  const isSelected = useMemo(() => selected.includes(upsale.id), [selected, upsale.id]);
  const { product } = useUpsaleProduct(upsale.id);
  const variant = product
    ? product.variants.find((v) => v.id === upsale.selectedVariant) || product.variants[0]
    : undefined;
  const images = product ? (variant?.image ? [variant.image] : product.images) : undefined;

  return (
    <>
      <a class="back-btn" onClick={() => setExpandedUpsale(null)}>
        &larr; <span>{settings.backText}</span>
      </a>

      <div className="w-full h-24 xs:h-28 flex items-center justify-center">
        {images ? (
          images.map((image) => (
            <div
              key={image.id}
              className={`h-20 w-20 xs:h-24 xs:w-24 ${
                shapeToClass[settings.shape]
              } flex-shrink-0 overflow-hidden bg-white ml-1 mr-2`}
            >
              <img className="object-cover w-full h-full" src={image.url} alt={image.altText} />
            </div>
          ))
        ) : (
          <div
            className={`h-20 w-20 xs:h-24 xs:w-24 ${
              shapeToClass[settings.shape]
            } flex-shrink-0 overflow-hidden bg-white`}
          >
            <Skeleton className="h-full" noLeading={true} />
          </div>
        )}
      </div>
      <div className="py-3 px-6 md:px-32 w-full">
        <div className="justify-center w-full">
          <div className="font-medium text-gray-700 text-md sm:text-lg md:text-xl leading-5 sm:leading-6 text-center">
            {product ? product.title : <Skeleton />}
          </div>
          <div className="mt-2 text-xs xs:text-sm sm:text-md leading-4 text-gray-500 text-center">
            {product ? product.description : <Skeleton />}
          </div>
        </div>
        <div className="mt-3 mx-5">
          <SelectVariant shape={settings.shape} item={upsale} {...{ isSelected, selectVariant }} />
        </div>
        <div className="mt-6 w-full">
          <ItemPrice settings={settings} item={upsale} alignment={"center"} />
        </div>
        <div className="mt-6 w-full text-center">
          <CartBtn
            item={upsale}
            settings={settings}
            selected={isSelected}
            onClick={() => selectUpsale(upsale.id)}
            hideReadMoreLink
          />
        </div>
      </div>
    </>
  );
});

export default ExpandedUpsale;
