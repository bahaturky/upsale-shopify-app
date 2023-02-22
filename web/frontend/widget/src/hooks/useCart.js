import useSWR from "swr";
import fetcher from "../helpers/fetcher";

function useCart() {
  const { data, isValidating } = useSWR("/cart.js", fetcher);

  return { cart: data, isLoading: isValidating };
}

export default useCart;
