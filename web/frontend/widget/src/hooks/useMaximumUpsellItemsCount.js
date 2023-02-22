import { useMemo } from "react";
import useCollection from "./useCollection";
import useProduct from "./useProduct";

function useMaximumUpsellItemsCount(settings) {
  const collection = useCollection();
  const product = useProduct();

  return useMemo(
    () =>
      (settings.limit?.options || []).reduce((cum, option) => {
        const containsCollection = !!option.collections?.find((p) => p.id === collection?.gid);
        const containsProduct = !!option.products?.find((p) => p.id === product?.gid);

        if (containsCollection || containsProduct) {
          return option.quantity;
        }

        return cum;
      }, settings.limit?.all),
    [collection, product, settings.limit]
  );
}

export default useMaximumUpsellItemsCount;
