import React from "react";

import * as Designs from "./Designs";

const UpsaleItem = ({ i, item, settings, handleSelect, isSelected, selectVariant }) => {
  const DesignComponent = Designs[settings.design];
  const design = settings.design || "aaa";

  let className = design === "aaa" || design === "ddd" || design === "eee" ? "py-3 px-3" : "mt-2 py-3 px-3 flex";

  if (design === "aaa") {
    className += " mt-2";
  }

  if (design === "ddd" || design === "eee") {
    className += " flex flex-col";
  }

  className += " select-none relative cursor-pointer bg-white border-2 overflow-hidden";

  const shapeToClass = {
    square: "",
    halfRounded: "rounded-sm",
    rounded: "rounded-md",
  };

  className += ` ${shapeToClass[settings.shape]}`;

  const borderColor = isSelected ? settings.primaryColor.hex : "#fff";

  return (
    <div
      className={className}
      onClick={handleSelect}
      style={{
        borderColor,
      }}
    >
      <DesignComponent {...{ item, settings, isSelected, selectVariant }} />
    </div>
  );
};

export default UpsaleItem;
