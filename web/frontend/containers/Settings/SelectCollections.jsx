import { TextField } from "@satel/formik-polaris";
import _ from "lodash";
import { Card, FormLayout, ResourceList, ResourceItem, Button, Avatar, TextStyle } from "@shopify/polaris";
import { useField } from "formik";
import { ResourcePicker } from "@shopify/app-bridge-react";
import { Fragment, useCallback, useState } from "react";

const IMAGE_PLACEHOLDER = "https://res.cloudinary.com/island/image/upload/v1626748982/no-product_cw8wg6.png";
const EMPTY_ARRAY = [];

const SelectCollections = ({ t, fieldName }) => {
  const [pickerProps, setPickerProps] = useState({});
  const [fieldValue, , { setValue }] = useField(fieldName);
  const value = fieldValue.value || EMPTY_ARRAY;

  const onSelectCollections = useCallback(() => {
    setPickerProps((state) => ({
      ...state,
      initialSelectionIds: value.map(({ id }) => ({ id })),
      open: true,
    }));
  }, [value, setPickerProps]);

  const onItemRemove = useCallback(
    (id) => {
      setValue(value.filter((p) => p.id !== id));
    },
    [value, setValue]
  );

  return (
    <>
      <div style={{ marginLeft: "-2rem", marginRight: "-2rem" }}>
        <ResourceList
          emptyState={<p style={{ opacity: 0.5, padding: "1rem 2rem" }}>{t("select-collections-empty-state")}</p>}
          items={value}
          renderItem={({ id, title, descriptionHtml, imageUrl }) => (
            <ResourceItem
              id={id}
              url={`https://${window.shopOrigin}/admin/collections/${id.split("/").pop()}`}
              external
              verticalAlignment="center"
              media={<Avatar size="small" source={imageUrl || IMAGE_PLACEHOLDER} />}
              shortcutActions={[
                {
                  content: t("common:remove"),
                  onAction: onItemRemove.bind(this, id),
                },
              ]}
            >
              <h3>
                <TextStyle variation="strong">{title}</TextStyle>
              </h3>
              {descriptionHtml ? <div dangerouslySetInnerHTML={{ __html: descriptionHtml }} /> : null}
            </ResourceItem>
          )}
        />
      </div>

      <div style={{ marginTop: "1rem" }}>
        <Button onClick={onSelectCollections}>{t("common:select-collections")}</Button>
      </div>

      {pickerProps.open ? (
        <ResourcePicker
          resourceType="Collection"
          open={false}
          showHidden={false}
          showVariants={false}
          allowMultiple={true}
          onSelection={({ selection }) => {
            setValue(
              selection.map(({ id, handle, title, descriptionHtml, image }) => ({
                id,
                handle,
                title,
                descriptionHtml,
                imageUrl: image?.originalSrc,
              }))
            );
            setPickerProps((state) => ({ ...state, open: false }));
          }}
          onCancel={() => setPickerProps((state) => ({ ...state, open: false }))}
          {...pickerProps}
        />
      ) : null}
    </>
  );
};

export default SelectCollections;
