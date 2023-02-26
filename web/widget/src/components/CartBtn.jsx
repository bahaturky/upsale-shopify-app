import React, { useCallback, useContext, useMemo, useState } from "react";
import { DEFAULT_SETTINGS } from "../constants";
import ExpandUpsaleContext from "../contexts/ExpandUpsaleContext";

const CartBtn = ({ item, selected, settings, displayLabel = true, size, onClick, hideReadMoreLink }) => {
  const [isHovered, setHover] = useState(false);
  const isTouchSupported = useMemo(() => typeof window !== "undefined" && ('ontouchstart' in window || navigator.msMaxTouchPoints), []);

  const shapeToClass = {
    square: "",
    halfRounded: "rounded-md",
    rounded: displayLabel ? "rounded-xl" : "rounded-full",
  };

  const setExpandedUpsale = useContext(ExpandUpsaleContext);

  const actionColor = settings.actionColor || settings.primaryColor;
  const textColor = { hex: "#fff" };
  const primaryColor = settings.actionColorInverse ? textColor : settings.actionColor || settings.primaryColor;
  const secondaryColor = settings.actionColorInverse ? settings.actionColor || settings.primaryColor : textColor;

  const onReadMore = useCallback(
    (e) => {
      e.stopPropagation();
      e.preventDefault();

      setExpandedUpsale(item.id);
    },
    [item]
  );

  return (
    <div className="flex flex-col items-center cart-btn">
      <div
        onMouseEnter={isTouchSupported ? undefined : () => setHover(!isHovered)}
        onMouseLeave={isTouchSupported ? undefined : () => setHover(!isHovered)}
        {...{ onClick }}
        className={`text-center font-normal flex justify-center items-center border border-gray-500
          ${size === "xs" ? "text-2xs md:text-xs" : "text-sm"}
          ${displayLabel ? (size === "xs" ? "py-1 px-3" : "py-1 px-8") : "p-3"}
          ${shapeToClass[settings.shape]}
        `}
        style={{
          cursor: "pointer",
          border: `1px solid ${actionColor.hex}`,
          color: isHovered || selected ? textColor.hex : primaryColor.hex,
          backgroundColor: isHovered || selected ? actionColor.hex : secondaryColor.hex,
        }}
      >
        <div>
          {selected ? (
            <svg
              className={`
                ${size === "xs" ? "w-3" : "w-5"}
              `}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <g>
                <path d="M5 13l4 4L19 7" />
              </g>
            </svg>
          ) : (
            <svg
              className={`
                ${size === "xs" ? "w-3" : "w-5"}
              `}
              viewBox="0 0 100 100"
              stroke="currentColor"
              fill="currentColor"
            >
              <g transform="translate(0,-952.36218)">
                <path
                  d="M 49.875 6.96875 A 1.0001 1.0001 0 0 0 49 8 L 49 49 L 8 49 A 1.0001 1.0001 0 0 0 7.8125 49 A 1.0043849 1.0043849 0 0 0 8 51 L 49 51 L 49 92 A 1.0001 1.0001 0 1 0 51 92 L 51 51 L 92 51 A 1.0001 1.0001 0 1 0 92 49 L 51 49 L 51 8 A 1.0001 1.0001 0 0 0 49.875 6.96875 z "
                  transform="translate(0,952.36218)"
                />
              </g>
            </svg>
          )}
        </div>
        {displayLabel && (
          <div
            className={`label
            ${size === "xs" ? "ml-1 md:ml-3" : "ml-3"}
          `}
          >
            {selected ? settings.addedText : settings.addText}
          </div>
        )}
      </div>
      {!hideReadMoreLink && item?.showReadMore && (
        <a
          href={`https://live.islandapps.co/upsales/${item.id}/redirect`}
          target="_blank"
          className="mt-1 text-xs"
          style={{
            color: actionColor.hex,
          }}
          onClick={onReadMore}
        >
          {settings.readMoreText || DEFAULT_SETTINGS.readMoreText}
        </a>
      )}
    </div>
  );
};

export default CartBtn;
