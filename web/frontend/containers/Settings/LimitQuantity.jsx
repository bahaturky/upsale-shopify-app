// import { TextField } from "@satel/formik-polaris";
import _ from "lodash";
import {
    Card,
    FormLayout,
    ResourceList,
    ResourceItem,
    Button,
    Avatar,
    TextStyle,
    TextField,
} from "@shopify/polaris";
import { useField } from "formik";
import { ResourcePicker } from "@shopify/app-bridge-react";
import { Fragment, useCallback, useState } from "react";

const IMAGE_PLACEHOLDER =
    "https://res.cloudinary.com/island/image/upload/v1626748982/no-product_cw8wg6.png";
const EMPTY_OPTION = {};
const EMPTY_VALUE = "";

const encode = (value) => (value ? parseInt(value) : null);
const decode = (value) => (value ? value.toString() : EMPTY_VALUE);

const LimitQuantityOption = ({
    t,
    index,
    option,
    setProductPickerProps,
    setCollectionPickerProps,
}) => {
    const [{ value }, , { setValue }] = useField("limit");
    const { options = [] } = value;
    const { quantity, collections = [], products = [] } = option;

    const onRemoveOption = useCallback(
        () =>
            setValue({
                ...value,
                options: options.filter((x) => x !== option),
            }),
        [value, options, option, setValue]
    );

    const onQuantityReset = useCallback(() => {
        setValue({
            ...value,
            options: options.map((o) =>
                o !== option ? o : { ...option, quantity: EMPTY_VALUE }
            ),
        });
    }, [value, options, option, setValue]);

    const onItemRemove = useCallback(
        (id) => {
            setValue({
                ...value,
                options: options.map((o) =>
                    o !== option
                        ? o
                        : {
                              ...option,
                              products: products.filter((p) => p.id !== id),
                              collections: collections.filter(
                                  (c) => c.id !== id
                              ),
                          }
                ),
            });
        },
        [value, options, option, setValue]
    );

    const onSelectProducts = useCallback(() => {
        setProductPickerProps((state) => ({
            ...state,
            option,
            initialSelectionIds: products.map(({ id }) => ({ id })),
            open: true,
        }));
    }, [products, option, setProductPickerProps]);

    const onSelectCollections = useCallback(() => {
        setCollectionPickerProps((state) => ({
            ...state,
            option,
            initialSelectionIds: collections.map(({ id }) => ({ id })),
            open: true,
        }));
    }, [collections, option, setProductPickerProps]);

    return (
        <Fragment key={index}>
            <Card.Section
                title={t("limit-quantity-option-title").replace(
                    "{number}",
                    index + 1
                )}
                actions={[
                    {
                        content: t("common:remove"),
                        destructive: true,
                        onAction: onRemoveOption,
                    },
                ]}
            >
                <FormLayout>
                    <TextField
                        type="number"
                        name={`limit.options[${index}].quantity`}
                        placeholder={t("limit-quantity-no-limit")}
                        label={t("limit-quantity-field-label")}
                        {...{ encode, decode }}
                        suffix={
                            quantity ? (
                                <Button plain onClick={onQuantityReset}>
                                    {t("limit-quantity-no-limit")}
                                </Button>
                            ) : null
                        }
                        min={1}
                    />
                </FormLayout>
            </Card.Section>

            <ResourceList
                emptyState={
                    <p
                        style={{
                            opacity: 0.5,
                            paddingLeft: "2rem",
                            paddingRight: "2rem",
                        }}
                    >
                        {t("limit-quantity-option-empty-state")}
                    </p>
                }
                items={[...collections, ...products]}
                renderItem={({ id, title, descriptionHtml, imageUrl }) => (
                    <ResourceItem
                        id={id}
                        url={`https://${window.shopOrigin}/admin/products/${id
                            .split("/")
                            .pop()}`}
                        external
                        verticalAlignment="center"
                        media={
                            <Avatar
                                size="small"
                                source={imageUrl || IMAGE_PLACEHOLDER}
                            />
                        }
                        shortcutActions={[
                            {
                                content: t("common:remove"),
                                onAction: onItemRemove.bind(undefined, id),
                            },
                        ]}
                    >
                        <h3>
                            <TextStyle variation="strong">{title}</TextStyle>
                        </h3>
                        {descriptionHtml ? (
                            <div
                                dangerouslySetInnerHTML={{
                                    __html: descriptionHtml,
                                }}
                            />
                        ) : null}
                    </ResourceItem>
                )}
            />

            <Card.Section>
                <div>
                    <span style={{ marginRight: "1rem" }}>
                        <Button onClick={onSelectProducts}>
                            {t("common:select-products")}
                        </Button>
                    </span>

                    <Button onClick={onSelectCollections}>
                        {t("common:select-collections")}
                    </Button>
                </div>
            </Card.Section>
        </Fragment>
    );
};

const LimitQuantity = ({ t }) => {
    const [{ value }, , { setValue }] = useField("limit");
    const [productPickerProps, setProductPickerProps] = useState({});
    const [collectionPickerProps, setCollectionPickerProps] = useState({});
    const { all, options = [] } = value;

    const onAddOption = useCallback(() => {
        setValue({ ...value, options: options.concat(EMPTY_OPTION) });
    }, [value, options, setValue]);

    const onAllValueReset = useCallback(() => {
        setValue({ ...value, all: EMPTY_VALUE });
    }, [value, setValue]);

    return (
        <>
            <Card
                title={t("limit-quantity")}
                actions={[
                    {
                        content: t("limit-quantity-add-option"),
                        onAction: onAddOption,
                    },
                ]}
            >
                <Card.Section>
                    <FormLayout>
                        <TextField
                            type="number"
                            name="limit.all"
                            placeholder={t("limit-quantity-no-limit")}
                            label={t("limit-quantity-field-label")}
                            suffix={
                                all ? (
                                    <Button plain onClick={onAllValueReset}>
                                        {t("limit-quantity-no-limit")}
                                    </Button>
                                ) : null
                            }
                            {...{ encode, decode }}
                            min={1}
                        />
                    </FormLayout>
                </Card.Section>
                {options.map((option, index) => (
                    <LimitQuantityOption
                        key={index}
                        {...{
                            t,
                            index,
                            option,
                            setProductPickerProps,
                            setCollectionPickerProps,
                        }}
                    />
                ))}
            </Card>

            {productPickerProps.open ? (
                <ResourcePicker
                    resourceType="Product"
                    open={false}
                    showHidden={false}
                    showVariants={false}
                    allowMultiple={true}
                    onSelection={({ selection }) => {
                        setValue({
                            ...value,
                            options: options.map((o) =>
                                o !== productPickerProps.option
                                    ? o
                                    : {
                                          ...productPickerProps.option,
                                          products: selection.map(
                                              ({
                                                  id,
                                                  handle,
                                                  title,
                                                  descriptionHtml,
                                                  images,
                                              }) => ({
                                                  id,
                                                  handle,
                                                  title,
                                                  descriptionHtml,
                                                  imageUrl:
                                                      images[0]?.originalSrc,
                                              })
                                          ),
                                      }
                            ),
                        });
                        setProductPickerProps((state) => ({
                            ...state,
                            open: false,
                        }));
                    }}
                    onCancel={() =>
                        setProductPickerProps((state) => ({
                            ...state,
                            open: false,
                        }))
                    }
                    {...productPickerProps}
                />
            ) : null}

            {collectionPickerProps.open ? (
                <ResourcePicker
                    resourceType="Collection"
                    open={false}
                    showHidden={false}
                    showVariants={false}
                    allowMultiple={true}
                    onSelection={({ selection }) => {
                        setValue({
                            ...value,
                            options: options.map((o) =>
                                o !== collectionPickerProps.option
                                    ? o
                                    : {
                                          ...collectionPickerProps.option,
                                          collections: selection.map(
                                              ({
                                                  id,
                                                  handle,
                                                  title,
                                                  descriptionHtml,
                                                  image,
                                              }) => ({
                                                  id,
                                                  handle,
                                                  title,
                                                  descriptionHtml,
                                                  imageUrl: image?.originalSrc,
                                              })
                                          ),
                                      }
                            ),
                        });
                        setCollectionPickerProps((state) => ({
                            ...state,
                            open: false,
                        }));
                    }}
                    onCancel={() =>
                        setCollectionPickerProps((state) => ({
                            ...state,
                            open: false,
                        }))
                    }
                    {...collectionPickerProps}
                />
            ) : null}
        </>
    );
};

export default LimitQuantity;
