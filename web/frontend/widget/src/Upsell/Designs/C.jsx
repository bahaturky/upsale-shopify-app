import React from "react";

import { ItemImage, Added, SelectVariant, ItemPrice, ItemTextContent, CartBtn } from "../../components";

export default ({ item, settings, isSelected, selectVariant }) => (
  <>
    <ItemImage item={item} shape={settings.shape} />
    <div className="ml-2 xs:ml-4 flex flex-col justify-center md:w-full w-1/2">
      <ItemTextContent item={item} />
      <div className="mt-2 flex justify-between items-center w-full" style={{ flexWrap: "wrap" }}>
        {isSelected ? <Added settings={settings} /> : <ItemPrice settings={settings} item={item} />}
        <div className="mr-3" style={{ maxWidth: "100%" }}>
          <SelectVariant isSelected={isSelected} item={item} selectVariant={selectVariant} size="xs" />
        </div>
      </div>
    </div>
    <div className="ml-auto pl-2 w-14 flex flex-col justify-center items-center">
      <CartBtn item={item} selected={isSelected} settings={settings} displayLabel={false} />
    </div>
  </>
);
