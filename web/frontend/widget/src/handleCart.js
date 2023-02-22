import { DEFAULT_SETTINGS } from "./constants";
import storage from "./storage";

function displayVariant(variantId, message) {
  const allElements = Array.from(document.querySelectorAll(`a[href$="${variantId}"]`));

  let elements = allElements.filter((e) => !e.firstElementChild || e.firstElementChild.tagName !== "IMG");

  if (elements.length === 0) {
    elements = allElements;
  }

  if (elements.length > 0) {
    elements[elements.length - 1].insertAdjacentHTML(
      "afterend",
      `<div island-cart-discount style="font-size: 12px; font-weight: bold;">${message}</div>`
    );
  }
}

const FORMS = "form[action^='/checkout'], form[action^='/cart'], form[action^='/a/checkout']";

function applyDiscount() {
  const code = storage.getItem("island-discount");

  if (!code) return;

  const forms = document.querySelectorAll(FORMS);

  for (let form of forms) {
    const discountInput = form.querySelector("[name=discount]");
    if (discountInput) {
      discountInput.value = code;
    } else {
      form.insertAdjacentHTML("beforeend", `<input type="hidden" name="discount" value="${code}" />`);
    }
  }
}

export default (discountedProducts) => {
  const discountText = storage.getItem("island-discount-text");
  const customDiscountText = storage.getItem("island-custom-discount-text");
  const hideDiscount = storage.getItem("island-hide-discount");

  if (!hideDiscount) {
    document.querySelectorAll("[island-cart-discount]").forEach((n) => n.remove());

    if (discountedProducts) {
      discountedProducts.forEach((dp) =>
        displayVariant(
          dp.variantId,
          dp.customCode 
            ? customDiscountText || DEFAULT_SETTINGS.customDiscountText
            : (
              discountText
                ? discountText.replace(/{{\s*discount\s*}}/, dp.discount)
                : `Discount ${dp.discount}% will be applied at checkout.`
            )
        )
      );
    }
  }

  applyDiscount();
};
