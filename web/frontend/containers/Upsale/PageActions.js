import { useState } from "react";
import * as P from "@shopify/polaris";
import { Modal } from "@shopify/app-bridge-react";
import axios from "../../axios";

import useToastContext from "../../hooks/useToastContext";
import { Router } from "../../../i18n";

const PageActions = ({
  handleSaveActivate,
  displaySaveAndActivate,
  isSubmitting,
  disabled,
  upsaleId,
  t,
}) => {
  const [isDeleteModalOpen, setDeleteModal] = useState(false);
  const [isDeleteLoading, setDeleteLoading] = useState(false);
  const addToast = useToastContext();

  const onDelete = async () => {
    try {
      setDeleteLoading(true);
      await axios.delete(`${HOST}/api/upsales/${upsaleId}`);
      Router.push(`/home?shop=${window.shopOrigin}`);
      addToast(t("upsell-deleted"));
    } catch (err) {
      console.log(err);
      setDeleteLoading(false);
    }
  };

  const handleOfferDelete = () => {
    if (IS_OFFLINE) onDelete();
    else setDeleteModal(true);
  };

  return (
    <>
      {!IS_OFFLINE && (
        <Modal
          title={t("delete-upsell")}
          open={isDeleteModalOpen}
          message={t("del-upsell-confirm")}
          primaryAction={{
            destructive: true,
            disabled: isDeleteLoading,
            content: t("yes-del-upsell"),
            onAction: onDelete,
          }}
          secondaryActions={[
            {
              content: t("no-del-upsell"),
              onAction: () => setDeleteModal(false),
            },
          ]}
          onClose={() => setDeleteModal(false)}
        />
      )}
      <div className="Polaris-PageActions">
        <P.Stack spacing="tight" distribution="equalSpacing">
          <P.ButtonGroup>
            <P.Button
              destructive
              onClick={
                upsaleId ? handleOfferDelete : () => Router.push(`/home?shop=${window.shopOrigin}`)
              }
            >
              {t("del-upsell")}
            </P.Button>

            <P.Button onClick={() => Router.push(`/home?shop=${window.shopOrigin}`)}>
              {t("common:cancel")}
            </P.Button>
          </P.ButtonGroup>

          <P.ButtonGroup>
            <P.Button
              id="save-button"
              submit
              primary={!displaySaveAndActivate}
              disabled={disabled}
              loading={isSubmitting}
            >
              {t("common:save")}
            </P.Button>
            {displaySaveAndActivate && (
              <P.Button
                primary
                disabled={disabled}
                loading={isSubmitting}
                onClick={handleSaveActivate}
              >
                {t("common:save-acti")}
              </P.Button>
            )}
          </P.ButtonGroup>
        </P.Stack>
      </div>
    </>
  );
};

export default PageActions;
