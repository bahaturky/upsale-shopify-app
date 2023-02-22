import storage from "./storage";
import throttle from "./throttle";
import fillCart from "./handleCart";

function applyDiscount() {
  let discountedProducts = localStorage.getItem("island-discounted-products");
  if (discountedProducts) discountedProducts = JSON.parse(discountedProducts);
  if (discountedProducts && discountedProducts.length > 0) {
    fillCart(discountedProducts);
  }
}

function updateCheckoutLinks() {
  const code = storage.getItem("island-discount");

  if (!code) return;

  function checkoutClickHandler(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
    const weglotLanguage = window.Weglot && window.Weglot.getCurrentLang();

    window.location = `/checkout?discount=${code}${weglotLanguage ? `&locale=${weglotLanguage}` : ""}`;
  }

  const nodes = document.querySelectorAll(
    '[href^="/checkout"],[name=return_to][value^="/checkout"],button[onclick],[data-component-checkout-button]'
  );
  const linkWithCode = `/checkout?discount=${code}`;
  for (const node of nodes) {
    if (node instanceof HTMLAnchorElement) {
      node.href = linkWithCode;
    }
    if (node instanceof HTMLInputElement) {
      node.value = linkWithCode;
    }
    if (
      node instanceof HTMLButtonElement &&
      node.attributes.onclick &&
      node.attributes.onclick.value.match(/location.*checkout/)
    ) {
      node.onclick = checkoutClickHandler;
    }
    if (node instanceof HTMLButtonElement && node.attributes["data-component-checkout-button"]) {
      node.onclick = checkoutClickHandler;
    }
  }
}

function watchForDrawerCart() {
  const throttledApplyDiscount = throttle(applyDiscount, 1000, true);
  const throttledUpdateCheckoutLinks = throttle(
    updateCheckoutLinks,
    1000,
    true
  );
  const callback = function (mutationsList) {
    throttledUpdateCheckoutLinks();
    for (const mutation of mutationsList) {
      if (mutation.type === "childList") {
        for (var node of mutation.addedNodes) {
          if (
            (node.action &&
              (node.action.indexOf("/cart") > -1 ||
                node.action.indexOf("/checkout") > -1 ||
                node.action.indexOf("/a/checkout") > -1)) ||
            (node.querySelector && node.querySelector("a[href*='?variant=']"))
          ) {
            throttledApplyDiscount();
          }
        }
      }
    }
  };

  try {
    const observer = new MutationObserver(callback);
    const targetNode = document.body;
    observer.observe(targetNode, { childList: true, subtree: true });
  } catch (error) {
    console.log("Failed to setup drawer cart observer", error);
  }
}

export const updateDiscounts = () => {
  applyDiscount();
  updateCheckoutLinks();
};

export const handleDiscounts = () => {
  updateDiscounts();
  watchForDrawerCart();
};
