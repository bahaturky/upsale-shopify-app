import * as P from "@shopify/polaris";
import { useField } from "formik";
import { ToggleSwitch } from "../../components";

const SelectShape = ({ t }) => {
  const [field, meta, helpers] = useField("shape");
  const { setValue } = helpers;

  return (
    <P.Card sectioned title={t("select-shape")}>
      <P.FormLayout>
        <ToggleSwitch
          options={[
            {
              icon: 'square',
              value: 'square'
            },
            {
              icon: 'half-rounded',
              value: 'halfRounded'
            },
            {
              icon: 'rounded',
              value: 'rounded'
            }
          ]}
          onChange={setValue}
          selected={field.value}
        />
      </P.FormLayout>
    </P.Card>
  );
};

export default SelectShape;
