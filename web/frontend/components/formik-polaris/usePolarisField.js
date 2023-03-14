import { useEffect, useCallback, useMemo } from "react";
import { useFormikContext } from "formik";

// eslint-disable-next-line import/prefer-default-export
export function usePolarisField(props) {
    const { name, encode, decode, validate } = props;

    // Modified from https://github.com/jaredpalmer/formik/blob/5553720b5d6c9729cb3b12fd7948f28ad3be9adc/src/Field.tsx#L74

    const {
        registerField,
        unregisterField,
        getFieldProps,
        getFieldMeta,
        isSubmitting,
        setFieldError,
        setFieldValue,
    } = useFormikContext();

    useEffect(() => {
        if (name) {
            registerField(name, { validate });
        }
        return () => {
            if (name) {
                unregisterField(name);
            }
        };
    }, [name, registerField, unregisterField, validate]);

    const field = getFieldProps({ name });
    const meta = getFieldMeta(name);

    const value = useMemo(
        () => (decode ? decode(field.value) : field.value),
        [decode, field.value]
    );

    const handleFocus = useCallback(() => {
        setFieldError(name, "");
    }, [name, setFieldError]);

    const handleBlur = useCallback(() => {
        field.onBlur({ target: { name } });
    }, [field, name]);

    const handleChange = useCallback(
        (v) => {
            setFieldValue(name, encode ? encode(v) : v);
        },
        [encode, name, setFieldValue]
    );

    const error = useMemo(() => {
        if (meta.error && meta.touched) {
            return meta.error;
        }

        return undefined;
    }, [meta.error, meta.touched]);

    return useMemo(
        () => ({
            ...field,
            ...meta,
            handleFocus,
            handleBlur,
            handleChange,
            value,
            isSubmitting,
            error,
        }),
        [
            error,
            field,
            handleBlur,
            handleChange,
            handleFocus,
            isSubmitting,
            meta,
            value,
        ]
    );
}
