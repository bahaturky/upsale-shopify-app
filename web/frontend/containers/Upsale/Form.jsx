import React, { useState, useContext } from "react";
import * as P from "@shopify/polaris";
import {
    TitleBar,
    ResourcePicker,
    Context as AppBridgeContext,
} from "@shopify/app-bridge-react";
import { TextField as TextFieldFormik } from "../../components/formik-polaris";
import { Redirect } from "@shopify/app-bridge/actions";
import { Formik, Form } from "formik";
// import { Router } from "../../../i18n";
import { object, number } from "yup";
// import axios from "../../axios";
import { ToggleSwitch } from "../../components";
import ImagePicker from "../../components/ImagePicker";
import { DEFAULT_PRODUCT } from "./constants";
import { Preview } from "../../components";
import PageActions from "./PageActions";
import Targeting from "./Targeting";
import ProductSelect from "./ProductSelect";
import useToastContext from "../../hooks/useToastContext";
import SelectProducts from "../Settings/SelectProducts";
import { useAuthenticatedFetch } from "../../hooks";
import { useNavigate } from "react-router-dom";

const stripHtml = (html) => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    const res = tmp && (tmp.textContent || tmp.innerText);
    return res ? res.substring(0, 60) : "";
};

const FormComponent = ({
    product,
    isSubmitting,
    shop,
    handleFormSubmit,
    isNew,
    upsaleId,
    breadcrumb,
    setProduct,
    t,
}) => {
    const [device, setDevice] = useState("mobile");

    const appBridge = useContext(AppBridgeContext);
    const addToast = useToastContext();

    const fetch = useAuthenticatedFetch();
    const navigate = useNavigate();

    const redirectToProduct = () => {
        if (
            product &&
            (product.gId ||
                (product.id && product.id.includes("gid://shopify")))
        ) {
            const redirect = Redirect.create(appBridge);
            const productGid = product.gId ? product.gId : product.id;
            redirect.dispatch(Redirect.Action.ADMIN_SECTION, {
                name: Redirect.ResourceType.Product,
                resource: {
                    id: productGid.split("Product/")[1],
                },
            });
        }
    };

    const changeDevice = (value) => {
        setDevice(value);
    };

    let initialValues = null;

    if (IS_OFFLINE && isNew) {
        initialValues = {
            title: DEFAULT_PRODUCT.title,
            desc: "Loose fitting olive green jacket with buttons and large pockets",
            discount: "0",
            targetAll: true,
            targets: [], // DEFAULT_TARGETS,
            isActive: false,
            selectedVariants: ["all"],
            imageUrl: null,
        };
    }

    return (
        <Formik
            initialValues={
                initialValues || {
                    title: "",
                    displayDiscount:
                        product?.discount > 0
                            ? "discount"
                            : product?.customDiscountCode
                            ? "custom"
                            : null,
                    targetAll:
                        product && product.targets
                            ? product.targets.includes("all")
                            : true,
                    isActive: false,
                    imageUrl: null,
                    ...(product ? product : {}),
                    desc: (product && product.desc) || "",
                    targets:
                        product &&
                        product.targets &&
                        !product.targets.includes("all")
                            ? product.targets
                            : [],
                    discount:
                        product && product.discount
                            ? product.discount.toString()
                            : "0",
                    picker: null,
                }
                // shop.settings || { ...SCHEMA.default(), primaryColor: defaultPrimaryColor }
            }
            validationSchema={object({
                discount: number()
                    .label(t("discount"))
                    .integer()
                    .min(0)
                    .max(100),
            })}
            onSubmit={handleFormSubmit}
        >
            {({ values, handleSubmit, setFieldValue, setValues }) => {
                // If local development, add test data
                const addDefaultProduct = () => {
                    const desc = stripHtml(DEFAULT_PRODUCT.descriptionHtml);

                    setProduct({
                        ...DEFAULT_PRODUCT,
                        desc,
                        image: DEFAULT_PRODUCT.image || null,
                        selectedVariants: ["all"],
                    });

                    setValues({
                        ...values,
                        title: DEFAULT_PRODUCT.title,
                        desc,
                        selectedVariants: ["all"],
                    });
                };

                const handleProductSelection = (resource) => {
                    const p = resource.selection[0];
                    const desc = stripHtml(p.descriptionHtml);

                    setProduct({
                        id: p.id,
                        title: p.title,
                        desc,
                        image: p.images.length ? p.images[0].originalSrc : null,
                        selectedVariants: ["all"],
                        variants: p.variants,
                    });
                    setValues({
                        ...values,
                        title: p.title,
                        desc,
                        selectedVariants: ["all"],
                    });
                    setFieldValue("picker", null);
                };

                const handleTargetSelection = (resource) => {
                    if (resource.selection.length) {
                        setFieldValue("targetAll", false);
                        setFieldValue("targets", resource.selection);
                    }
                    setFieldValue("picker", null);
                };

                const handleSaveActivate = () => {
                    setFieldValue("isActive", true);
                    handleSubmit();
                };

                const toggleProduct = async () => {
                    try {
                        const isActive = values.isActive;
                        setFieldValue("isActive", !isActive);

                        await fetch(`/api/upsales/${product.id}/toggle`, {
                            body: JSON.stringify({}),
                            method: "patch",
                            headers: {
                                "Content-type": "application/json",
                            },
                        });

                        addToast(
                            `${t("common:upsell")} ${
                                !isActive
                                    ? t("common:activated")
                                    : t("common:deactivated")
                            }.`
                        );
                    } catch (err) {
                        console.error("toggle error", err);
                    }
                };

                const secondaryActions = [
                    {
                        content: t("common:cancel"),
                        onAction: () =>
                            navigate(`/home?shop=${window.shopOrigin}`),
                    },
                ];

                const displaySaveAndActivate =
                    isNew || (!isNew && product && !product.isActive);

                if (displaySaveAndActivate) {
                    secondaryActions.push({
                        content: t("common:save"),
                        disabled: !!!product,
                        onAction: handleSubmit,
                        loading: isSubmitting,
                    });
                } else if (!isNew && product) {
                    secondaryActions.push({
                        content: values.isActive
                            ? t("common:deactivate")
                            : t("common:activate"),
                        destructive: values.isActive,
                        onAction: toggleProduct,
                    });
                }

                return (
                    <>
                        {!IS_OFFLINE && (
                            <>
                                <TitleBar
                                    title={
                                        isNew
                                            ? t("common:new-upsell")
                                            : t("upsell-conf")
                                    }
                                    primaryAction={{
                                        content: displaySaveAndActivate
                                            ? t("common:save-acti")
                                            : t("common:save"),
                                        disabled: !!!product,
                                        onAction: displaySaveAndActivate
                                            ? handleSaveActivate
                                            : handleSubmit,
                                        loading: isSubmitting,
                                    }}
                                    secondaryActions={secondaryActions}
                                    breadcrumbs={breadcrumb}
                                />
                                {values.picker === "Collection" && (
                                    <ResourcePicker
                                        resourceType="Collection"
                                        showHidden={false}
                                        allowMultiple={true}
                                        open={!!values.picker}
                                        onSelection={handleTargetSelection}
                                        onCancel={() =>
                                            setFieldValue("picker", null)
                                        }
                                    />
                                )}
                                {values.picker &&
                                    values.picker.includes("roduct") && (
                                        <ResourcePicker
                                            resourceType="Product"
                                            showVariants={false}
                                            showHidden={false}
                                            allowMultiple={
                                                values.picker !== "main-product"
                                            }
                                            open={!!values.picker}
                                            onSelection={
                                                values.picker === "main-product"
                                                    ? handleProductSelection
                                                    : handleTargetSelection
                                            }
                                            onCancel={() =>
                                                setFieldValue("picker", null)
                                            }
                                        />
                                    )}
                            </>
                        )}
                        <div className="relative">
                            <Form>
                                <div className="w-full md:w-350px md:min-h-750">
                                    <div className="hidden md:block">
                                        <P.Card>
                                            <div className="px-6 py-8">
                                                <ToggleSwitch
                                                    options={[
                                                        {
                                                            icon: "phone",
                                                            value: "mobile",
                                                        },
                                                        {
                                                            icon: "computer",
                                                            value: "desktop",
                                                        },
                                                    ]}
                                                    onChange={changeDevice}
                                                    selected={device}
                                                />
                                            </div>
                                        </P.Card>
                                    </div>
                                    <ProductSelect
                                        product={product}
                                        onClick={() =>
                                            IS_OFFLINE
                                                ? addDefaultProduct()
                                                : setFieldValue(
                                                      "picker",
                                                      "main-product"
                                                  )
                                        }
                                        isNew={isNew}
                                        values={values}
                                        setFieldValue={setFieldValue}
                                        t={t}
                                    />

                                    {product && (
                                        <>
                                            <P.Card sectioned>
                                                <P.FormLayout>
                                                    <P.Labelled
                                                        label={t("image")}
                                                    >
                                                        <P.ChoiceList
                                                            choices={[
                                                                {
                                                                    label: "Use product image",
                                                                    value: false,
                                                                },
                                                                {
                                                                    label: "Use different image",
                                                                    value: true,
                                                                },
                                                            ]}
                                                            selected={[
                                                                values.imageUrl !==
                                                                    null,
                                                            ]}
                                                            onChange={([
                                                                selected,
                                                            ]) =>
                                                                setFieldValue(
                                                                    "imageUrl",
                                                                    selected
                                                                        ? ""
                                                                        : null
                                                                )
                                                            }
                                                        />

                                                        <P.Collapsible
                                                            open={
                                                                values.imageUrl !==
                                                                null
                                                            }
                                                        >
                                                            <br />
                                                            <ImagePicker
                                                                name="imageUrl"
                                                                {...{
                                                                    upsaleId,
                                                                }}
                                                            />
                                                        </P.Collapsible>
                                                    </P.Labelled>

                                                    <TextFieldFormik
                                                        name="title"
                                                        label={t(
                                                            "common:title"
                                                        )}
                                                        maxLength={50}
                                                        showCharacterCount
                                                    />
                                                    <TextFieldFormik
                                                        name="desc"
                                                        label={t("desc")}
                                                        maxLength={70}
                                                        showCharacterCount
                                                    />

                                                    <P.Checkbox
                                                        label={t(
                                                            "show-read-more"
                                                        )}
                                                        checked={
                                                            values.showReadMore
                                                        }
                                                        onChange={() =>
                                                            setFieldValue(
                                                                "showReadMore",
                                                                !values.showReadMore
                                                            )
                                                        }
                                                    />
                                                </P.FormLayout>
                                                <br />
                                                <P.ChoiceList
                                                    label={t("discount")}
                                                    choices={[
                                                        {
                                                            label: t(
                                                                "not-apply-discount"
                                                            ),
                                                            value: null,
                                                        },
                                                        {
                                                            label: t(
                                                                "apply-discount"
                                                            ),
                                                            value: "discount",
                                                        },
                                                        {
                                                            label: t(
                                                                "apply-custom-discount"
                                                            ),
                                                            value: "custom",
                                                        },
                                                    ]}
                                                    selected={[
                                                        values.displayDiscount,
                                                    ]}
                                                    onChange={([value]) => {
                                                        setFieldValue(
                                                            "displayDiscount",
                                                            value
                                                        );
                                                        setFieldValue(
                                                            "discount",
                                                            value === "discount"
                                                                ? "20"
                                                                : "0"
                                                        );
                                                        setFieldValue(
                                                            "customDiscountCode",
                                                            values.displayDiscount ===
                                                                "custom"
                                                                ? values.customDiscountCode
                                                                : ""
                                                        );
                                                    }}
                                                />
                                                {values.displayDiscount ===
                                                    "discount" && (
                                                    <>
                                                        <br />
                                                        <TextFieldFormik
                                                            name="discount"
                                                            label={t(
                                                                "amount-off"
                                                            )}
                                                            type="number"
                                                            min={0}
                                                            max={100}
                                                            suffix="%"
                                                        />
                                                    </>
                                                )}
                                                {values.displayDiscount ===
                                                    "custom" && (
                                                    <>
                                                        <br />
                                                        <TextFieldFormik
                                                            name="customDiscountCode"
                                                            label={t(
                                                                "custom-discount-code"
                                                            )}
                                                            helpText={
                                                                <span
                                                                    dangerouslySetInnerHTML={{
                                                                        __html: t(
                                                                            "custom-discount-disclaimer"
                                                                        ).replace(
                                                                            /(href=['"])/g,
                                                                            `$1https://${window.shopOrigin}`
                                                                        ),
                                                                    }}
                                                                ></span>
                                                            }
                                                        />
                                                    </>
                                                )}
                                            </P.Card>
                                            <Targeting
                                                values={values}
                                                setFieldValue={setFieldValue}
                                                setPicker={(v) =>
                                                    setFieldValue("picker", v)
                                                }
                                                t={t}
                                            />
                                            <P.Card
                                                sectioned
                                                title={t(
                                                    "when-already-exists-in-cart"
                                                )}
                                            >
                                                <P.ChoiceList
                                                    choices={[
                                                        {
                                                            label: t(
                                                                "show-if-exists-in-cart"
                                                            ),
                                                            value: false,
                                                        },
                                                        {
                                                            label: t(
                                                                "hide-if-exists-in-cart"
                                                            ),
                                                            value: true,
                                                        },
                                                    ]}
                                                    selected={[
                                                        !!values.settings
                                                            ?.hideIfExistsInCart,
                                                    ]}
                                                    onChange={([selected]) =>
                                                        setFieldValue(
                                                            "settings.hideIfExistsInCart",
                                                            selected
                                                        )
                                                    }
                                                />
                                            </P.Card>
                                            <P.Card
                                                sectioned
                                                title={t(
                                                    "when-products-in-cart"
                                                )}
                                            >
                                                <P.ChoiceList
                                                    choices={[
                                                        {
                                                            label: t(
                                                                "show-if-products-in-cart"
                                                            ),
                                                            value: false,
                                                        },
                                                        {
                                                            label: t(
                                                                "hide-if-products-in-cart"
                                                            ),
                                                            value: true,
                                                        },
                                                    ]}
                                                    selected={[
                                                        !!values.settings
                                                            ?.hideIfProductsInCart,
                                                    ]}
                                                    onChange={([selected]) =>
                                                        setFieldValue(
                                                            "settings.hideIfProductsInCart",
                                                            selected
                                                                ? []
                                                                : false
                                                        )
                                                    }
                                                />
                                                <P.Collapsible
                                                    open={
                                                        !!values.settings
                                                            ?.hideIfProductsInCart
                                                    }
                                                >
                                                    <SelectProducts
                                                        {...{ t }}
                                                        fieldName="hideIfProductsInCart"
                                                    />
                                                </P.Collapsible>
                                            </P.Card>
                                            <P.Card
                                                sectioned
                                                title={t(
                                                    "when-product-is-removed-from-cart"
                                                )}
                                            >
                                                <P.ChoiceList
                                                    choices={[
                                                        {
                                                            label: t(
                                                                "keep-in-cart"
                                                            ),
                                                            value: false,
                                                        },
                                                        {
                                                            label: t(
                                                                "remove-from-cart"
                                                            ),
                                                            value: true,
                                                        },
                                                    ]}
                                                    selected={[
                                                        !!values.settings
                                                            ?.removeWithProduct,
                                                    ]}
                                                    onChange={([selected]) =>
                                                        setFieldValue(
                                                            "settings.removeWithProduct",
                                                            selected
                                                        )
                                                    }
                                                />
                                            </P.Card>
                                            <P.Card
                                                sectioned
                                                title={t("show-to")}
                                            >
                                                <P.ChoiceList
                                                    choices={[
                                                        {
                                                            label: t(
                                                                "all-devices"
                                                            ),
                                                            value: undefined,
                                                        },
                                                        {
                                                            label: t(
                                                                "mobile-only"
                                                            ),
                                                            value: "mobile",
                                                        },
                                                        {
                                                            label: t(
                                                                "desktop-only"
                                                            ),
                                                            value: "desktop",
                                                        },
                                                    ]}
                                                    selected={[
                                                        values.settings?.showTo,
                                                    ]}
                                                    onChange={([selected]) =>
                                                        setFieldValue(
                                                            "settings.showTo",
                                                            selected
                                                        )
                                                    }
                                                />
                                            </P.Card>
                                            <P.Card title={t("modify-price")}>
                                                <P.Card.Section>
                                                    <p>{t("mp")}</p>
                                                    <br />
                                                    <P.Button
                                                        onClick={
                                                            redirectToProduct
                                                        }
                                                    >
                                                        {t("update-product")}
                                                    </P.Button>
                                                </P.Card.Section>
                                            </P.Card>
                                            <P.Card
                                                title={t("true-upsale-title")}
                                            >
                                                <P.Card.Section>
                                                    <p>
                                                        {t(
                                                            "true-upsale-description"
                                                        )}
                                                    </p>
                                                    <br />
                                                    <P.Checkbox
                                                        label={t(
                                                            "true-upsale-checkbox"
                                                        )}
                                                        checked={
                                                            values.isTrueUpsell
                                                        }
                                                        onChange={() =>
                                                            setFieldValue(
                                                                "isTrueUpsell",
                                                                !values.isTrueUpsell
                                                            )
                                                        }
                                                    />
                                                </P.Card.Section>
                                            </P.Card>

                                            <P.Card
                                                title={t("compare-price-title")}
                                            >
                                                <P.Card.Section>
                                                    <P.Checkbox
                                                        label={t(
                                                            "compare-price-checkbox"
                                                        )}
                                                        checked={
                                                            !!values.settings
                                                                ?.showCompareAtPrice
                                                        }
                                                        onChange={(v) => {
                                                            setFieldValue(
                                                                "settings.showCompareAtPrice",
                                                                v
                                                            );
                                                        }}
                                                    />
                                                </P.Card.Section>
                                            </P.Card>

                                            <P.Card
                                                title={t(
                                                    "artificial-price-title"
                                                )}
                                            >
                                                <P.Card.Section>
                                                    <p>
                                                        {t(
                                                            "artificial-price-description"
                                                        )}
                                                    </p>
                                                    <br />
                                                    <P.Checkbox
                                                        label={t(
                                                            "artificial-price-checkbox"
                                                        )}
                                                        checked={
                                                            !!values.settings
                                                                ?.isArtificialPriceEnabled
                                                        }
                                                        onChange={(v) => {
                                                            setFieldValue(
                                                                "settings.isArtificialPriceEnabled",
                                                                v
                                                            );
                                                        }}
                                                    />
                                                    <p>
                                                        {t(
                                                            "artificial-price-note"
                                                        )}
                                                    </p>
                                                    {!!values.settings
                                                        ?.isArtificialPriceEnabled && (
                                                        <>
                                                            <br />
                                                            <br />
                                                            <P.TextField
                                                                name="artificialPrice"
                                                                label={t(
                                                                    "artificial-price-label"
                                                                )}
                                                                value={
                                                                    !!values
                                                                        .settings
                                                                        ?.artificialPrice
                                                                        ? values
                                                                              .settings
                                                                              .artificialPrice
                                                                        : 0
                                                                }
                                                                onChange={(v) =>
                                                                    setFieldValue(
                                                                        "settings.artificialPrice",
                                                                        v
                                                                    )
                                                                }
                                                                onBlur={() => {
                                                                    if (
                                                                        !!values
                                                                            .settings
                                                                            ?.artificialPrice
                                                                    ) {
                                                                        if (
                                                                            !values.settings.artificialPrice.includes(
                                                                                "."
                                                                            )
                                                                        ) {
                                                                            setFieldValue(
                                                                                "settings.artificialPrice",
                                                                                `${values.settings.artificialPrice}.00`
                                                                            );
                                                                        } else if (
                                                                            values.settings.artificialPrice.includes(
                                                                                "."
                                                                            )
                                                                        ) {
                                                                            if (
                                                                                values.settings.artificialPrice.split(
                                                                                    "."
                                                                                )[1]
                                                                                    .length ===
                                                                                0
                                                                            ) {
                                                                                setFieldValue(
                                                                                    "settings.artificialPrice",
                                                                                    `${values.settings.artificialPrice}00`
                                                                                );
                                                                            } else if (
                                                                                values.settings.artificialPrice.split(
                                                                                    "."
                                                                                )[1]
                                                                                    .length ===
                                                                                1
                                                                            ) {
                                                                                setFieldValue(
                                                                                    "settings.artificialPrice",
                                                                                    `${values.settings.artificialPrice}0`
                                                                                );
                                                                            }
                                                                        }
                                                                    }
                                                                }}
                                                                min={0}
                                                                suffix={shop.moneyFormat.replace(
                                                                    "{{amount_with_comma_separator}}",
                                                                    ""
                                                                )}
                                                            />
                                                            <br />
                                                            <P.Checkbox
                                                                label={t(
                                                                    "artificial-compare-at-price-checkbox"
                                                                )}
                                                                checked={
                                                                    !!values
                                                                        .settings
                                                                        ?.isArtificialCompareAtPriceEnabled
                                                                }
                                                                onChange={(
                                                                    v
                                                                ) => {
                                                                    setFieldValue(
                                                                        "settings.isArtificialCompareAtPriceEnabled",
                                                                        v
                                                                    );
                                                                }}
                                                            />
                                                            {!!values.settings
                                                                ?.isArtificialCompareAtPriceEnabled && (
                                                                <>
                                                                    <br />
                                                                    <br />
                                                                    <P.TextField
                                                                        name="artificialCompareAtPrice"
                                                                        label={t(
                                                                            "artificial-compare-at-price-label"
                                                                        )}
                                                                        value={
                                                                            !!values
                                                                                .settings
                                                                                ?.artificialCompareAtPrice
                                                                                ? values
                                                                                      .settings
                                                                                      .artificialCompareAtPrice
                                                                                : 0
                                                                        }
                                                                        onChange={(
                                                                            v
                                                                        ) => {
                                                                            setFieldValue(
                                                                                "settings.artificialCompareAtPrice",
                                                                                v
                                                                            );
                                                                        }}
                                                                        onBlur={() => {
                                                                            if (
                                                                                !!values
                                                                                    .settings
                                                                                    ?.artificialCompareAtPrice
                                                                            ) {
                                                                                if (
                                                                                    !values.settings.artificialCompareAtPrice.includes(
                                                                                        "."
                                                                                    )
                                                                                ) {
                                                                                    setFieldValue(
                                                                                        "settings.artificialCompareAtPrice",
                                                                                        `${values.settings.artificialCompareAtPrice}.00`
                                                                                    );
                                                                                } else if (
                                                                                    values.settings.artificialCompareAtPrice.includes(
                                                                                        "."
                                                                                    )
                                                                                ) {
                                                                                    if (
                                                                                        values.settings.artificialCompareAtPrice.split(
                                                                                            "."
                                                                                        )[1]
                                                                                            .length ===
                                                                                        0
                                                                                    ) {
                                                                                        setFieldValue(
                                                                                            "settings.artificialCompareAtPrice",
                                                                                            `${values.settings.artificialCompareAtPrice}00`
                                                                                        );
                                                                                    } else if (
                                                                                        values.settings.artificialCompareAtPrice.split(
                                                                                            "."
                                                                                        )[1]
                                                                                            .length ===
                                                                                        1
                                                                                    ) {
                                                                                        setFieldValue(
                                                                                            "settings.artificialCompareAtPrice",
                                                                                            `${values.settings.artificialCompareAtPrice}0`
                                                                                        );
                                                                                    }
                                                                                }
                                                                            }
                                                                        }}
                                                                        min={0}
                                                                        suffix={shop.moneyFormat.replace(
                                                                            "{{amount_with_comma_separator}}",
                                                                            ""
                                                                        )}
                                                                    />
                                                                </>
                                                            )}
                                                        </>
                                                    )}
                                                </P.Card.Section>
                                            </P.Card>
                                        </>
                                    )}
                                </div>
                                <Preview
                                    upsales={
                                        product
                                            ? [{ ...product, ...values }]
                                            : []
                                    }
                                    shop={shop}
                                    device={device}
                                />
                                <br />
                                <br />
                                <PageActions
                                    handleSaveActivate={handleSaveActivate}
                                    isSubmitting={isSubmitting}
                                    disabled={!!!product}
                                    upsaleId={upsaleId}
                                    displaySaveAndActivate={
                                        displaySaveAndActivate
                                    }
                                    t={t}
                                />
                            </Form>
                        </div>
                    </>
                );
            }}
        </Formik>
    );
};

export default FormComponent;
