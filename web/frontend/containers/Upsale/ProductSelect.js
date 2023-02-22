import * as P from "@shopify/polaris";

import VariantSelector from "./VariantSelector";

const noProductImg =
  "https://res.cloudinary.com/island/image/upload/v1626748982/no-product_cw8wg6.png";

const ProductSelect = ({
  product,
  onClick,
  isNew,
  setFieldValue,
  values,
  t,
}) => {
  const onVariantChange = (targetEntity, selectedItems) => {
    setFieldValue("selectedVariants", selectedItems);
  };

  return (
    <P.Card sectioned>
      {product ? (
        <div className="border border-gray-200 rounded-md shadow">
          <P.ResourceList.Item
            media={
              <P.Thumbnail
                size="small"
                source={product.image ? product.image : noProductImg}
              />
            }
          >
            <div className="OfferListItem__Main">
              {values.title || product.title}{" "}
              <P.Button plain onClick={onClick}>
                ({t("change")})
              </P.Button>
            </div>
            <div>
              <VariantSelector
                selectedVariants={values.selectedVariants || []}
                product={product}
                onVariantChange={(selectedItems) =>
                  onVariantChange(product, selectedItems)
                }
                t={t}
              />
            </div>
          </P.ResourceList.Item>
        </div>
      ) : (
        <P.Button onClick={onClick} disabled={!isNew}>
          {t("pick-product")}
        </P.Button>
      )}
    </P.Card>
  );
};

export default ProductSelect;
