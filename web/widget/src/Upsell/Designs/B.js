import React, { useCallback, useContext } from "react";

import { Added, SelectVariant, ItemPrice, ItemTextContent, ItemImage } from "../../components";
import ExpandUpsaleContext from "../../contexts/ExpandUpsaleContext";

const DesignA = ({ item, settings, isSelected, selectVariant }) => {
  const setExpandedUpsale = useContext(ExpandUpsaleContext);

  const onReadMore = useCallback(
    (e) => {
      e.stopPropagation();
      e.preventDefault();

      setExpandedUpsale(item.id);
    },
    [item]
  );

  return (
    <>
      <div className="flex flex-col justify-center w-full mr-2 xs:mr-4" style={{ overflow: "hidden" }}>
        <ItemTextContent item={item} />
        <div className="flex items-center justify-between w-full mt-2" style={{ flexWrap: "wrap" }}>
          {isSelected ? <Added settings={settings} /> : <ItemPrice settings={settings} item={item} />}
          <SelectVariant size="xs" isSelected={isSelected} item={item} selectVariant={selectVariant} />
        </div>
      </div>
      <div class="flex flex-col items-center cart-btn">
        <ItemImage item={item} shape={settings.shape} />
        
        {item?.showReadMore && (
          <a
            href={`https://live.islandapps.co/upsales/${item.id}/redirect`}
            target="_blank"
            class="mt-1 text-xs"
            onClick={onReadMore}
          >
            {settings.readMoreText}
          </a>
        )}
      </div>
    </>
  );
};

export default DesignA;
