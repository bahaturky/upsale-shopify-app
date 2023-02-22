import timeLimit from "time-limit-promise";
import storage from "./storage";
import { parseJson } from "./helpers";

const TRACKED_UPSALES_KEY = "island-tracked-upsales";
const TRACKING_KEY = "island-tracking";

function getTrackedUpsales() {
  const data = storage.getItem(TRACKED_UPSALES_KEY);
  if (data) {
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }
  return [];
}

const getCart = () => parseJson(fetch(`/cart.js`));

export default class Tracker {
  constructor() {
    this.cartToken = storage.getItem(TRACKING_KEY);

    if (!this.cartToken) {
      getCart().then(({ token }) => {
        this.cartToken = token;
        storage.setItem(TRACKING_KEY, token);
      });
    }
    this.shop = window.islandUpsell.shop;
  }

  trackView(upsales) {
    return this.track({
      event: "view",
      data: upsales.map((u) => ({
        upsaleId: u.id,
      })),
    });
  }

  async trackAddToCart(data) {
    const trackedUpsales = getTrackedUpsales();

    storage.setItem(
      TRACKED_UPSALES_KEY,
      JSON.stringify(
        trackedUpsales && trackedUpsales.length
          ? [...trackedUpsales, ...data]
          : data
      )
    );
    return this.track({
      event: "addToCart",
      data,
    });
  }

  async trackRemoveFromCart(offer) {
    return this.track({
      event: "remove_from_cart",
      offer: offer.id,
      data: {},
    });
  }

  async trackCheckout(data) {
    if (this.cartToken && data) {
      // 1. récupérer en storage les variants avec leurs upsales ids

      const trackedUpsales = getTrackedUpsales();

      if (trackedUpsales && trackedUpsales.length) {
        // 2. filtrer les line_items qui correspondent
        let items = [];
        let copyLineItems = data.line_items.slice();
        trackedUpsales.forEach((u) => {
          const item = copyLineItems.find(
            (o) => o.variant_id.toString() === u.variantId
          );
          if (item) {
            items.push({ ...u, price: parseFloat(item.price) });
            const index = copyLineItems.indexOf(item);
            if (index > -1) copyLineItems.splice(index, 1);
          }
        });

        if (items.length) {
          this.track({
            event: "transaction",
            data: items,
          });
        }
        // 3. remove tracking token & tracked upsales
        storage.removeItem(TRACKING_KEY);
        storage.removeItem(TRACKED_UPSALES_KEY);
      }
    }
  }

  track(data) {
    const fetchResult = parseJson(
      fetch(`${window.islandUpsell.HOST}/api/food`, {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify({
          cartToken: this.cartToken,
          shop: this.shop,
          ...data,
        }),
      })
    ).catch((error) => console.log(error));

    return timeLimit(fetchResult, 500);
  }
}
