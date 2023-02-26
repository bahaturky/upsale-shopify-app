import React from "react";

import { ItemImage, SelectVariant, ItemPrice, ItemTextContent, CartBtn } from "../../components";

export default ({ item, settings, isSelected, selectVariant }) => (
  <>
    <div className="w-full h-24 xs:h-28 flex items-center justify-center">
      <ItemImage item={item} shape={settings.shape} />
    </div>
    <div className="py-3 px-6 md:px-32 w-full">
      <div className="justify-center w-full">
        <ItemTextContent item={item} alignment={"center"} />
      </div>
      <div className="mt-3 mx-5">
        <SelectVariant shape={settings.shape} isSelected={isSelected} item={item} selectVariant={selectVariant} />
      </div>
      <div className="mt-6 w-full">
        <ItemPrice settings={settings} item={item} alignment={"center"} />
      </div>
      <div className="mt-6 w-full text-center">
        <CartBtn item={item} selected={isSelected} settings={settings} />
      </div>
    </div>
  </>
);
