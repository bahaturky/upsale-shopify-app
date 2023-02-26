import React from "react";

import {
  ItemImage,
  SelectVariant,
  ItemPrice,
  ItemTextContent,
  CartBtn,
} from "../../components";

export default ({ item, settings, isSelected, selectVariant }) => (
  <>
    {/* Tailwind do not apply flex: 1 in this case */}
    <div style={{ flex: "1 1 0%" }}>
      <div className="w-full h-24 xs:h-28 flex items-center justify-center">
        <ItemImage item={item} shape={settings.shape} />
      </div>
      <div className="px-0 md:px-3 w-full flex flex-col flex-1">
        <div className="flex-1">
          <div className="mr-2 xs:mr-4 justify-center w-full">
            <ItemTextContent item={item} alignment="center" size="sm" displayDescription={false} />
          </div>
          <div className="mt-3" style={{ maxWidth: "100%" }}>
            <SelectVariant isSelected={isSelected} item={item} selectVariant={selectVariant} size="xs" />
          </div>
        </div>
      </div>
    </div>
    <div className="mt-3 w-full">
      <ItemPrice settings={settings} item={item} alignment="center" size="xs" />
    </div>
    <div className="mt-3 w-full flex justify-center">
      <CartBtn item={item} selected={isSelected} settings={settings} size="xs" />
    </div>
  </>
);
