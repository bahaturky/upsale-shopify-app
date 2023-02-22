import useSWR from "swr/immutable";
import fetcher from "../helpers/fetcher";

function useUpsaleProduct(upsaleId) {
  const { data, isValidating } = useSWR(
    `${(typeof window !== "undefined" ? window.islandUpsell?.HOST : null) || ""}/upsales/${upsaleId}/product`,
    fetcher
  );

  return { product: data, isLoading: isValidating };
}

export default useUpsaleProduct;
