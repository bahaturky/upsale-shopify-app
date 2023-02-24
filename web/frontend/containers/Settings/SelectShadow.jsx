import * as P from "@shopify/polaris";
import { useField } from "formik";
import { ToggleSwitch } from "../../components";

const SelectShadow = ({ t }) => {
  const [field, meta, helpers] = useField("shadow");
  const { setValue } = helpers;

  return (
    <P.Card sectioned title={t("select-shadow")}>
      <P.FormLayout>
        <ToggleSwitch
          options={[
            {
              children: <div style={{ width: 20, height: 20, borderRadius: 5, border: "1px solid black", backgroundColor: "white" }}></div>,
              value: null
            },
            {
              children: <div style={{ width: 20, height: 20, borderRadius: 5, border: "1px solid black", backgroundColor: "white", boxShadow: "0 1px 3px rgba(0, 0, 0, 0.5)" }}></div>,
              value: 'light'
            },
            {
              children: <div style={{ width: 20, height: 20, borderRadius: 5, border: "1px solid black", backgroundColor: "white", boxShadow: "0 7px 15px rgba(0, 0, 0, 0.5)" }}></div>,
              value: 'strong'
            }
          ]}
          onChange={setValue}
          selected={field.value || null}
        />
      </P.FormLayout>
    </P.Card>
  );
};

export default SelectShadow;
