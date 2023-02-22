import { useState, useEffect } from "react";
import * as P from "@shopify/polaris";

const variantAvailable = (variant) =>
  !variant.inventoryManagement ||
  variant.inventoryManagement.toLowerCase() === "not_managed" ||
  variant.inventoryPolicy.toLowerCase() === "continue" ||
  variant.inventoryQuantity > 0;

const VariantSelector = ({ product, selectedVariants, onVariantChange, t }) => {
  const [variantsExpanded, setVariantsExpanded] = useState(
    !!(
      selectedVariants &&
      selectedVariants.length &&
      !selectedVariants.includes("all")
    )
  );

  useEffect(
    () => {
      if (product.variants && product.variants.length) {
        const validVariants = selectedVariants.filter((selectedVariantId) =>
          product.variants.find((v) => v.id === selectedVariantId)
        );
        if (validVariants.length !== selectedVariants.length) {
          onVariantChange(validVariants);
        }
      }
      setVariantsExpanded(
        !!(
          selectedVariants &&
          selectedVariants.length &&
          !selectedVariants.includes("all")
        )
      );
    },
    [product, selectedVariants] // eslint-disable-line react-hooks/exhaustive-deps
  );

  if (!product.variants || product.variants.length === 1) {
    return null;
  }

  if (variantsExpanded) {
    return (
      <P.ChoiceList
        allowMultiple
        choices={product.variants.map(({ id, title, ...variant }) => ({
          label: `${title}${
            variantAvailable(variant) ? "" : ` - ${t("sold-out")}`
          }`,
          value: id,
        }))}
        selected={selectedVariants}
        onChange={onVariantChange}
      />
    );
  }

  return (
    <P.Button plain onClick={() => setVariantsExpanded(true)}>
      {t("all-variants")}
    </P.Button>
  );
};

export default VariantSelector;
