import { debounce } from "tiny-throttle";

export const getDiscountedPrice = (price, discount) => {
  if (!discount) return price;

  let discountAmount;

  if (typeof discount === "object") {
    discountAmount = -(discount.amount ? discount.amount : (parseFloat(discount.percentage) / 100) * price);
  } else {
    discountAmount = (discount * price) / 100;
  }

  return discountAmount > 0 ? Math.max(price - discountAmount, 0).toFixed(2) : price;
}

export async function parseJson(fetchPromise) {
  const response = await fetchPromise;
  if (response.status >= 500) {
    throw Error("Something unexpected happened.");
  }
  if (response.status === 404) {
    return null;
  }
  try {
    const jsonResponse = await response.json();
    return jsonResponse;
  } catch (err) {
    return response;
  }
}

export const ajaxApiRequestConfig = (method) => ({
  method,
  credentials: "same-origin",
  headers: {
    "Content-Type": "application/json; charset=utf-8",
  },
});

// All kind of add to cart buttons
const ATCselectors = [
  ".btn-add-to-cart",
  ".add-to-cart",
  ".add-to-cart-button",
  ".addtocart",
  ".qsc-btn--add-to-cart",
  ".add_to_cart_btn",
  "#AddToCart",
  "#add-to-cart-btn",
  "#shopify_add_to_cart",
  ".AddToCart",
  ".btn-addtocart",
  "#btn-add-to-cart",
  ".addToCart",
  ".button_add_to_cart",
  "#addToCartButton",
  "#add-to-cart",
  "#btnAddToCart",
  ".add-to-cart-btn",
  ".button-add-to-cart",
  ".add_to_cart_button",
  ".AddtoCart",
  ".btn--sticky_addtocart",
  ".add_to_cart",
  "#addToCartBtn",
  ".btn_add_to_cart",
  ".hs-btn-add-to-cart-2",
].reduce((acc, curr) => [...acc, `button${curr}`, `input${curr}`, `a${curr}`], [
  ".product-atc__button",
  'form[action^="/cart/add"] button[type=submit]:not(.shopify-payment-button__button):not(.shopify-payment-button__more-options)',
  ".g-stickybar-buynow",
  ".btn--add-to-cart",
  "[name=addToCart]",
  "[data-add-to-cart]",
  "#new-form-atc",
  "[name=AddToCart]",
  '[data-action="AddToCart"]',
  "[name=add]",
  'button[data-pf-type="ProductATC"]',
  ".cart__checkout-btn",
  ".product-atc-btn",
  'button[data-zp-link-type="cart"]',
  'a[href^="/cart/add"]',
  ".product-form--atc-button",
  'form[action="/cart/add"] .shg-btn',
  ".product_buttonContainer-addToCart a",
  "#mwAddToCart",
  'form[action^="/cart/add"] [data-product-add]',
  '[data-action="add-to-cart"]',
  ".complete-design-a",
  'form[action^="/cart/add"] input[type=submit]',
  'form[action="/cart/add"] #button-cart',
  ".add-to-cart input.button",
  'input[data-btn-addtocart]'
]);

function filterCheckoutForms(button) {
  try {
    const form = button.closest("form");
    if (form && form.attributes && form.attributes.action) {
      return form.attributes.action.value !== "/checkout";
    }
    return true;
  } catch (error) {
    console.log("filterCheckoutForms", error);
    return true;
  }
}

export const getATCbtns = () => {
  let combinedSelectors = Array.from(document.querySelectorAll(ATCselectors));
  return Array.from(new Set(combinedSelectors)).filter(filterCheckoutForms);
};

const variantSelectors = ["[name='id']"].reduce(
  (acc, curr) => [...acc, `button${curr}`, `input${curr}`, `select${curr}`],
  []
);

export const getVariant = () => {
  let combinedSelectors = Array.from(
    document.querySelectorAll(variantSelectors)
  );
  const variants = Array.from(new Set(combinedSelectors)).filter(
    filterCheckoutForms
  );
  return variants.length ? variants[0].value : null;
};

const qtySelectors = ["[name='quantity']"].reduce(
  (acc, curr) => [...acc, `button${curr}`, `input${curr}`, `select${curr}`],
  []
);

export const getQuantity = () => {
  let combinedSelectors = Array.from(document.querySelectorAll(qtySelectors));
  const quantitySelectors = Array.from(new Set(combinedSelectors)).filter(
    filterCheckoutForms
  );
  return quantitySelectors.length ? quantitySelectors[0].value : 1;
};

export const addOriginalProductToCart = () => {
  console.log("window.islandItem", window.islandItem);
  if (window.islandItem)
    return parseJson(
      window.fetch("/cart/add.js", {
        ...ajaxApiRequestConfig("POST"),
        body: JSON.stringify({
          items: [window.islandItem],
        }),
      })
    );
};

export const hideButton = (button) =>
  button.setAttribute(
    "style",
    "display:none!important;visibility:hidden;position:absolute;left:-10000px;"
  );

export const getPairByHiddenButton = (button) =>
  window.islandButtonPairs
    ? window.islandButtonPairs.find((pair) => pair.hiddenBtn === button)
    : undefined;

export const watchButtonRemoval = (targetNode) => {
  let target = targetNode;
  function findInsertedButton(addedNodes, hiddenBtn) {
    return Array.from(addedNodes).find(
      (n) => n.nodeName === hiddenBtn.nodeName && n.type === hiddenBtn.type
    );
  }

  const callback = (mutationsList) => {
    for (const mutation of mutationsList) {
      if (mutation.type === "childList") {
        for (var node of mutation.removedNodes) {
          if (node === target) {
            console.log(
              `${node.tagName}#${node.id} is being removed. Updating reference.`
            );
            const buttonPair = getPairByHiddenButton(target);
            const previousHiddenBtn = buttonPair.hiddenBtn;
            buttonPair.hiddenBtn = findInsertedButton(
              mutationsList.flatMap((e) => Array.from(e.addedNodes)),
              buttonPair.hiddenBtn
            );
            target = buttonPair.hiddenBtn;
            if (target) {
              hideButton(target);

              buttonPair.clonedBtn.disabled = buttonPair.hiddenBtn.disabled;
              buttonPair.clonedBtn.className = buttonPair.hiddenBtn.className;
              buttonPair.clonedBtn.innerHTML = buttonPair.hiddenBtn.innerHTML;
              window.islandButtonPairs = window.islandButtonPairs.map((bp) =>
                bp.hiddenBtn === previousHiddenBtn ? buttonPair : bp
              );
            }
          }
        }
      }
    }
  };

  try {
    const observer = new MutationObserver(callback);

    observer.observe(targetNode.parentElement, { childList: true });
  } catch (error) {
    console.log("Failed to setup button removal observer", error);
  }
};

export const watchButtonChanges = (targetNode) => {
  const callback = () => {
    console.log(`${targetNode.id} is being modified. Updating content.`);
    const { clonedBtn, hiddenBtn } = getPairByHiddenButton(targetNode);
    if (hiddenBtn.style.display !== "none") {
      hideButton(hiddenBtn);
    }
    clonedBtn.disabled = hiddenBtn.disabled;
    clonedBtn.className = hiddenBtn.className;
    clonedBtn.innerHTML = hiddenBtn.innerHTML;
    clonedBtn.value = hiddenBtn.value;
  };

  try {
    const observer = new MutationObserver(debounce(callback, 300));

    observer.observe(targetNode, {
      childList: true,
      attributes: true,
      subtree: true,
      attributeFilter: ["disabled", "className", "style", "value"],
    });
  } catch (error) {
    console.log("Failed to setup button changes observer", error);
  }
};
