import * as P from "@shopify/polaris";
import { useField } from "formik";

const SelectDesign = ({ t }) => {
  const [field, meta, helpers] = useField("design");
  const { setValue } = helpers;

  return (
    <P.Card sectioned title={t("select-design")}>
      <P.FormLayout>
        <P.Select
          options={[
            {
              label: 'Upsell A',
              value: 'aaa'
            },
            {
              label: 'Upsell B',
              value: 'bbb'
            },
            {
              label: 'Upsell C',
              value: 'ccc'
            },
            {
              label: 'Upsell D',
              value: 'ddd'
            },
            {
              label: 'Upsell E',
              value: 'eee'
            }
          ]}
          onChange={setValue}
          value={field.value}
        />
        <P.Banner
          title={ t(`${field.value}-heading`) }
          status="info"
        >
          <p>{ t(`${field.value}-p`) }</p>
        </P.Banner>
      </P.FormLayout>
    </P.Card>
  );
};

export default SelectDesign;
