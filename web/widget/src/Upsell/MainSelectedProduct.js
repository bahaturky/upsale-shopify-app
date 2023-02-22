import React from "react";

import { Skeleton } from "../components";

const MainSelectedProduct = ({ product, settings, selected, isPreview }) => {
  const { hsl } = settings.primaryColor;
  return (
    <div
      className="relative flex p-2 mb-4 bg-red-100 rounded xs:p-3"
      style={{
        backgroundColor:
          selected && selected.length
            ? `hsla(
      ${hsl.hue}, ${hsl.saturation * 100}%, ${hsl.brightness * 100}%, 0.17)`
            : "#e5e5e5",
      }}
    >
      <div className="flex-shrink-0 w-16 h-16 overflow-hidden bg-white border border-gray-100 rounded xs:w-20 xs:h-20">
        {product && product.image ? (
          <img
            className="object-scale-down w-full h-full rounded"
            src={product.image.src}
            alt={product.title}
          />
        ) : (
          <Skeleton
            className="h-full"
            noLeading={true}
            isTransparent={true}
            isLoading={!isPreview}
          />
        )}
      </div>
      <div className="flex flex-col justify-center w-full ml-4 mr-2 truncate xs:mr-6 sm:mr-8">
        <div className="mt-2 mr-4 font-medium leading-5 text-gray-700 truncate text-md sm:text-lg sm:leading-6 xs:mr-6 sm:mr-8">
          {product ? (
            product.title
          ) : (
            <Skeleton isTransparent={true} isLoading={!isPreview} />
          )}
        </div>
      </div>
      <div className="absolute top-0 right-0 flex items-center p-1 m-2 bg-gray-300 rounded-full">
        {settings.topProductAddedToCartText && (
          <div className="ml-3 mr-2 font-bold tracking-wide text-gray-700 uppercase text-2xs xs:text-xs">
            {settings.topProductAddedToCartText}
          </div>
        )}
        <div
          className="flex items-center justify-center w-4 h-4 bg-gray-500 rounded-full xs:h-6 xs:w-6"
          style={{
            backgroundColor: product ? "rgb(55,66,81)" : "rgb(194,194,194)",
          }}
        >
          <svg
            className="w-3 h-3 text-white xs:h-4 xs:w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="4"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default MainSelectedProduct;
