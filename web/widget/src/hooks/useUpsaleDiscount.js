import useSWR from "swr/immutable";
import fetcher from "../helpers/fetcher";

function useUpsaleDiscount(upsaleId) {
  const { data, isValidating } = useSWR(
    upsaleId ? `${(typeof window !== "undefined" ? window.islandUpsell?.HOST : null) || ""}/upsales/${upsaleId}/discount` : null,
    fetcher
  );

  return { discount: data, isLoading: isValidating };
}

export default useUpsaleDiscount;
