import React, { useEffect, useState, useMemo, useCallback } from "react";
import Frame from "react-frame-component";

import { Modal } from "./components";
import Upsell from "./Upsell";
import { DEFAULT_SETTINGS } from "./constants";

import storage from "./storage";
import tryParseInt from "./helpers/tryParseInt";

import Tracker from "./tracking";
import {
  getATCbtns,
  // getVariant,
  // getQuantity,
  watchButtonRemoval,
  watchButtonChanges,
  hideButton,
} from "./helpers";
import { handleDiscounts } from "./discounts";

import useCart from "./hooks/useCart";
import useMediaQuery from "./hooks/useMediaQuery";

const MOBILE_MEDIA_QUERY = "(max-width: 768px)";

const App = () => {
  const [displayModal, setModal] = useState(false);
  const isProd = process.env.NODE_ENV === "production";
  const settings = useMemo(() => (isProd ? window.islandUpsell.settings : {}), []);
  const tracker = useMemo(() => (isProd ? new Tracker() : null), []);
  const { cart } = useCart();
  const isMobile = useMediaQuery(MOBILE_MEDIA_QUERY);
  const [{ collectionId, productId, variantId }, setState] = useState({});

  // Are we on order status page (just after checkout)?
  if (window.Shopify && window.Shopify.checkout && tracker) {
    // Yes?
    // Then clear the items and add upsales items bought to analytics
    storage.removeItem("island-products");
    storage.removeItem("island-discounted-products");
    storage.removeItem("island-discount");
    tracker.trackCheckout(window.Shopify.checkout);
  }

  const allItems = useMemo(() => (isProd ? window.islandUpsell.upsales : require("./assets/upsales.json")) || [], []);

  const upsales = useMemo(() => {
    if (!cart) return [];

    let items = allItems;

    console.log("upsales", { isProd });
    // console.log( 'collectionId, productId, variantId', collectionId, productId, variantId );

    if (isProd) {
      items = items.filter(
        (u) => u.targets.includes("all") || u.targets.find(
          (t) => (
            ( collectionId && t.id?.match( collectionId ) ) ||
            ( productId && t.id?.match( productId ) ) ||
            ( productId && t.hasOwnProperty('products') && t.products.find( (w) => w.match( productId ) ) )
          )
        )
      );
    }


    console.log("upsales", { filteredItems: items, collectionId, productId, variantId });

    items = items.filter((upsale) => {
      const { hideIfExistsInCart } = upsale.settings || {};
      if (!hideIfExistsInCart) return true;

      return !cart.items.find((i) => upsale.gId.match(i.product_id));
    });

    items = items.filter((upsale) => {
      const { hideIfProductsInCart } = upsale.settings || {};
      if (!hideIfProductsInCart) return true;

      return !cart.items.find((i) => hideIfProductsInCart.find((p) => p.id === i.gId));
    });

    items = items.filter((upsale) => {
      const { showTo } = upsale.settings || {};

      switch (showTo) {
        case "mobile": {
          if (!isMobile) {
            return false;
          }
          break;
        }
        case "desktop": {
          if (isMobile) {
            return false;
          }
          break;
        }
      }

      return true;
    });

    return items;
  }, [allItems, cart, collectionId, productId, variantId, isMobile]);

  const buttonPairs = useMemo(() => {
    let buttonPairs = [];

    // console.log( 'upsales.length', upsales.length );

    if (upsales.length && window.location.pathname !== "/cart") {
      buttonPairs = window.islandButtonPairs || [];

      if (!window.islandButtonPairs) {
        const buttons = getATCbtns();
        buttons.forEach((button) => {
          button.classList.add("island");
          const cloned = button.cloneNode(true);
          cloned.classList.add("island-cloned");
          button.insertAdjacentElement("afterend", cloned);
          hideButton(button);
          watchButtonRemoval(button);
          watchButtonChanges(button);

          buttonPairs.push({
            clonedBtn: cloned,
            hiddenBtn: button,
          });
        });

        window.islandButtonPairs = buttonPairs;
      }
    }

    return buttonPairs;
  }, [upsales]);

  useEffect(() => {
    let collectionId, productId, variantId;

    if (window.meta.page.pageType === "collection") {
      collectionId = tryParseInt(window.meta.page.resourceId);
    }

    if (window.meta.page.pageType === "product") {
      productId = tryParseInt(window.meta.page.resourceId);
    }

    // console.log( 'window.meta.page.pageType' );

    const form = document.querySelector("form[action='/cart/add']");
    if (form) {
      const idInput = form.querySelector('input[name="id"],select[name="id"]');

      variantId = tryParseInt(idInput?.value);
    }

    if (variantId) {
      const product =
        window.meta.product || window.meta.products.find((p) => p.variants.find((v) => v.id === variantId));

      if (product.variants.find((v) => v.id === variantId)) {
        productId = tryParseInt(product?.id);
      }
    }

    // console.log( 'collectionId, productId, variantId', collectionId, productId, variantId );

    setState({ collectionId, productId, variantId });
  }, []);

  // If visitor click one of the add to cart button
  // Register which button has been clicked, display the popup, and add the click to analytics
  const onAddToCartClick = useCallback(
    (event) => {
      // One time per session check
      if (settings && settings.oneTimePerSession && sessionStorage.getItem("island-upsell-opened")) return;
      if (upsales.length === 0) return;

      let collectionId, productId, variantId;

      if (window.meta.page.pageType === "collection") {
        collectionId = tryParseInt(window.meta.page.resourceId);
      }

      if (window.meta.page.pageType === "product") {
        productId = tryParseInt(window.meta.page.resourceId);
      }

      const form = event.target.closest("form");

      if (form) {
        const idInput = form.querySelector('input[name="id"],select[name="id"]');

        variantId = tryParseInt(idInput?.value);
      }

      if (variantId) {
        const product =
          window.meta.product || window.meta.products.find((p) => p.variants.find((v) => v.id === variantId));

        if (product.variants.find((v) => v.id === variantId)) {
          productId = tryParseInt(product?.id);
        }
      }

      console.log("clicked", { collectionId, productId, variantId });

      setState({ collectionId, productId, variantId });

      // Only on pages check
      if (settings && settings.onlyOnPages) {
        const onlyOnPages = settings.onlyOnPages.split(",");
        const pathname = window.location.pathname;

        for (let page of onlyOnPages) {
          if (page.endsWith("*")) {
            page = page.slice(0, -1);

            // Check if pathname start with page
            const regex = new RegExp(`^${page}`);

            if (!regex.test(pathname)) {
              return;
            }
          } else {
            // Check if pathname contain page
            const regex = new RegExp(`^${page}$`);

            if (!regex.test(pathname)) {
              return;
            }
          }
        }
      }

      try {
        let eventTarget = event.target;

        // Fix for some themes CTA
        if (
          event.target.classList.contains("btn__add-to-cart-text") &&
          event.target.parentElement.nodeName === "SPAN"
        ) {
          eventTarget = event.target.parentElement.parentElement;
        }

        if (
          (event.target.hasAttribute("data-add-to-cart-text") ||
            event.target.id === "AddToCartText" ||
            event.target.classList.contains("AddToCartText") ||
            event.target.nodeName === "SPAN") &&
          event.target.parentElement.nodeName === "BUTTON"
        ) {
          eventTarget = event.target.parentElement;
        }

        let clickedBtn = buttonPairs.find((b) => b.clonedBtn === eventTarget);
        if (clickedBtn) window.islandClickedBtn = clickedBtn;
        else clickedBtn = buttonPairs[0];

        event.preventDefault();
        event.stopImmediatePropagation();

        setModal(true);

        return false;
      } catch (err) {
        console.error("error display widget", err);
      }
    },
    [settings, upsales]
  );

  const onRemoveFromCartClick = useCallback(
    async (event) => {
      const link = event.target.closest("a");
      const href = link.getAttribute("href");
      const [, key] = href.match(/id=(.+?)&/);
      const { product_id: productId } = cart.items.find((item) => item.key === key);
      const upsellItems = cart.items.filter((item) => item.properties?._island_upsell_initial_product_id === productId);

      if (upsellItems.length > 0) {
        const updates = upsellItems.reduce((cum, item) => {
          const upsale = allItems.find((u) => u.gId.match(item.product_id));
          const removeWithProduct = upsale?.settings?.removeWithProduct;

          if (removeWithProduct) {
            return { ...cum, [item.id]: 0 };
          }

          return cum;
        }, {});

        if (Object.keys(updates).length > 0) {
          const interval = setInterval(() => {
            if (!document.body.contains(link)) {
              fetch("/cart/update.js", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ updates }),
              }).then(() => window.location.reload());

              clearInterval(interval);
            }
          }, 100);
        }
      }
    },
    [allItems, cart]
  );

  useEffect(() => {
    if (upsales.length && window.location.pathname !== "/cart") {
      // Fix for Debut
      // We comeback to default state if user clicked before widget loaded
      const debutButtons = Array.from(document.getElementsByClassName("product-form__cart-submit"));

      debutButtons.forEach((button) => {
        button.removeAttribute("aria-disabled");

        const text = button.querySelectorAll("[data-add-to-cart-text]");
        if (text.length > 0) {
          text[0].classList.remove("hide");
        }

        const loader = button.querySelectorAll("[data-loader]");
        if (loader.length > 0) {
          loader[0].classList.add("hide");
        }
      });

      if (buttonPairs) {
        buttonPairs.forEach((btn) => {
          btn.clonedBtn.addEventListener("click", onAddToCartClick, { capture: true });
        });
      }
    }

    if (settings?.discountText) {
      storage.setItem("island-discount-text", settings.discountText);
    } else {
      storage.removeItem("island-discount-text");
    }

    if (settings?.customDiscountText) {
      storage.setItem("island-custom-discount-text", settings.customDiscountText);
    } else {
      storage.removeItem("island-custom-discount-text");
    }

    if (settings?.hideDiscount) {
      storage.setItem("island-hide-discount", settings.hideDiscount);
    } else {
      storage.removeItem("island-hide-discount");
    }

    // Init watch for drawer cart & apply discount
    handleDiscounts();

    return () => {
      if (buttonPairs) {
        buttonPairs.forEach((btn) => {
          btn.clonedBtn.removeEventListener("click", onAddToCartClick, { capture: true });
        });
      }
    };
  }, [buttonPairs, upsales, onAddToCartClick]);

  useEffect(() => {
    if (window.location.pathname === "/cart") {
      const buttons = Array.from(document.querySelectorAll("cart-remove-button"));

      buttons.forEach((button) => {
        button.addEventListener("click", onRemoveFromCartClick);
      });

      return () => {
        buttons.forEach((button) => {
          button.removeEventListener("click", onRemoveFromCartClick);
        });
      };
    }
  }, [settings, onRemoveFromCartClick]);





  // When closing the upsell popup, we click on the hidden cloned button
  const handleClose = () => {
    if ( window.islandClickedBtn && !window.isIslandTrueUpsell ) {
      window.islandClickedBtn.hiddenBtn.click();
    }
    setModal(false);

    if ( settings.hasOwnProperty('redirect') && ( "default" !== settings.redirect ) ) {
      window.setTimeout(function() {
        window.location = '/' + settings.redirect;
      }, 3000);
    }
  };

  useEffect(() => {
    if (displayModal && upsales.length) {
      if (tracker) tracker.trackView(upsales);

      if (settings && settings.oneTimePerSession) {
        sessionStorage.setItem("island-upsell-opened", true);
      }
    }
  }, [displayModal && upsales.length]);

  return (
    <Frame
      title="island-upsell"
      style={
        displayModal
          ? {
              display: "block",
              border: "0px",
              top: "0px",
              zIndex: 2147483647,
              bottom: "0px",
              right: "0px",
              left: "0px",
              clear:
                "both" /* Because you have no idea what css could be applied to #someDiv - although with position: fixed, this shouldn't be necessary at all... */,
              position: "fixed",
              width: "100%" /* Fall back in case the vw is not supported. */,
              // eslint-disable-next-line no-dupe-keys
              width: "100vw",
              height: "100%" /* Fall back */,
              overflowX:
                "hidden" /* in case there is a few pixels spillage from padding, you don't want a horizontal scroll bar. */,
              overflowY: "auto",
            }
          : {
              display: "absolute",
              border: "0px",
              width: 0,
              height: 0,
            }
      }
      head={
        <>
          <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
          <link
            rel="stylesheet"
            href={`${isProd ? `${window.islandUpsell.HOST}/widget/build/index-prod` : "/index"}.css`}
          />
          {settings && !!settings.customCSS && <style>{settings.customCSS}</style>}
        </>
      }
    >
      <Modal
        isOpen={displayModal && upsales.length > 0}
        settings={settings ? { ...DEFAULT_SETTINGS, ...settings } : DEFAULT_SETTINGS}
        handleClose={handleClose}
      >
        <Upsell
          handleClose={handleClose}
          settings={settings ? { ...DEFAULT_SETTINGS, ...settings } : DEFAULT_SETTINGS}
          upsales={upsales}
          currency={isProd ? window.islandUpsell.shop.currency : null}
          verified={isProd ? window.islandUpsell.shop.isAppVerified : false}
          tracker={tracker}
        />
      </Modal>
    </Frame>
  );
};

export default App;
