import { useEffect } from "react";
import * as P from "@shopify/polaris";

import { DEFAULT_TARGETS, DEFAULT_TARGETS_COLLECTIONS } from "./constants";

const noProductImg = "https://res.cloudinary.com/island/image/upload/v1626748982/no-product_cw8wg6.png";

const Targeting = ({ values, setFieldValue, setPicker, t }) => {
  const addDefaultTargets = () => {
    console.log(DEFAULT_TARGETS);
    setFieldValue("targetAll", false);
    setFieldValue("targets", DEFAULT_TARGETS_COLLECTIONS); //DEFAULT_TARGETS);
  };

  const removeTarget = (target) => {
    setFieldValue(
      "targets",
      values.targets.filter(({ id }) => target.id !== id)
    );
  };

  useEffect(() => {
    if (!(values.targets && values.targets.length)) {
      setFieldValue("targetAll", true);
    }
  }, [values.targets]);

  return (
    <P.Card title={t("upsale-appear-on")}>
      <P.Card.Section>
        <P.Checkbox
          label={t("all-products")}
          checked={values.targetAll}
          onChange={() => {
            setFieldValue("targetAll", !values.targetAll);
            if (!values.targetAll) setFieldValue("targets", []);
          }}
        />
      </P.Card.Section>

      <P.Card.Section>
        {!!values.targets.length && (
          <>
            <P.Card>
              <P.ResourceList
                resourceName={{
                  singular: t("target"),
                  plural: t("targets"),
                }}
                items={values.targets}
                renderItem={(target) => (
                  <P.ResourceList.Item
                    media={
                      <P.Thumbnail
                        size="small"
                        source={
                          target.images && target.images.length
                            ? target.images[0].originalSrc.replace(
                                ".jpg",
                                `_medium.jpg`
                              )
                            : target.image || noProductImg
                        }
                      />
                    }
                    shortcutActions={[
                      {
                        content: t("delete"),
                        destructive: true,
                        onClick: () => removeTarget(target),
                      },
                    ]}
                  >
                    <div className="mt-4 OfferListItem__Main">
                      {target.title}
                    </div>
                  </P.ResourceList.Item>
                )}
              />
            </P.Card>
            <br />
          </>
        )}
        <P.ButtonGroup segmented>
          <P.Button
            onClick={() =>
              IS_OFFLINE ? addDefaultTargets() : setPicker("Product")
            }
          >
            {t("select-products")}
          </P.Button>
          <P.Button
            onClick={() =>
              IS_OFFLINE ? addDefaultTargets() : setPicker("Collection")
            }
          >
            {t("select-collections")}
          </P.Button>
        </P.ButtonGroup>
      </P.Card.Section>
    </P.Card>
  );
};

export default Targeting;
