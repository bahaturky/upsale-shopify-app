import { useState, useEffect } from "react";
import * as P from "@shopify/polaris";
import axios from "../../axios";
import Error from "next/error";

import Form from "./Form";
import useToastContext from "../../hooks/useToastContext";
import { withTranslation, Router } from "../../../i18n";

const isUUID = (id) =>
  !!id.match(
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/
  );

const Upsale = ({ query, t }) => {
  if (!query) return <Error title={t("upsale-404")} statusCode={404} />;
  const { id } = query;
  const isNew = !id || id === "new" || !isUUID(id);
  const [product, setProduct] = useState(null);
  const [isSubmitting, setSubmitting] = useState(false);
  const [isLoading, setLoading] = useState(true);
  const [upsaleId, setUpsaleId] = useState(null);
  const [shop, setShop] = useState(null);
  const addToast = useToastContext();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const shop = (await axios(`${HOST}/api/shop`)).data;
        if (shop) {
          const parsedSettings = shop.settings
            ? JSON.parse(shop.settings)
            : null;
          setShop({ ...shop, settings: parsedSettings });
        }
        if (id && id !== "new" && isUUID(id)) {
          const product = (await axios.get(`${HOST}/api/upsales/${id}`)).data;
          // console.log("product", product);
          if (product) {
            setProduct(product);
            setUpsaleId(product.id);
          }
        }
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleFormSubmit = async (values) => {
    try {
      setSubmitting(true);

      const payload = {
        ...values,
        targets:
          values.targetAll || !(values.targets && values.targets.length)
            ? ["all"]
            : values.targets.map((t) => ({
                id: t.id,
                handle: t.handle,
                selectedVariants: t.selectedVariants || [],
              })),
        selectedVariants: !!values.selectedVariants.length ? values.selectedVariants : ["all"],
      };

      if (upsaleId) {
        await axios.patch(`${HOST}/api/upsales/${upsaleId}`, {
          ...payload,
          gId: product.id.includes("gid") ? product.id : product.gId,
        });
      } else {
        await axios.post(`${HOST}/api/upsales`, {
          ...payload,
          gId: product.id,
        });
      }
      setSubmitting(false);
      addToast(
        `${t("saved")}${values.isActive ? ` & ${t("common:activated")}` : ""}.`
      );
      Router.push(`/home?shop=${window.shopOrigin}`);
    } catch (err) {
      console.log("submit upsale error", err);
      setSubmitting(false);
    }
  };

  const breadcrumb = [
    {
      content: t("common:dashboard"),
      onAction: () => Router.push(`/home?shop=${window.shopOrigin}`),
    },
  ];

  if (!isNew && !isLoading && !product) {
    return <Error title={t("upsale-404")} statusCode={404} />;
  }

  return (
    <P.Page
      breadcrumbs={breadcrumb}
      title={isNew ? t("common:new-upsell") : t("upsell-conf")}
    >
      {isLoading ? (
        <P.Spinner />
      ) : (
        <Form
          breadcrumb={breadcrumb}
          product={product}
          isSubmitting={isSubmitting}
          shop={shop}
          handleFormSubmit={handleFormSubmit}
          isNew={isNew}
          upsaleId={upsaleId}
          setProduct={setProduct}
          t={t}
        />
      )}
    </P.Page>
  );
};

Upsale.getInitialProps = ({ query, t }) => {
  return { query, t };
};

export default withTranslation("upsale")(Upsale);
