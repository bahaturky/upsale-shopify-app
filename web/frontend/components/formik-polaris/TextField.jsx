import React, { useEffect } from "react";
import {
    TextField as PolarisTextField,
} from "@shopify/polaris";
import { usePolarisField } from "./usePolarisField";

function TextField(props) {
    const { name, encode, decode, validate, ...polarisProps } = props;
    useEffect(() => {
        console.log('Text Fields')
    }, [])
    const {
        value: rawValue,
        isSubmitting,
        handleFocus,
        handleBlur,
        handleChange,
        error,
    } = usePolarisField({ name, encode, decode, validate });

    const value = rawValue === undefined ? "" : rawValue;
    if (typeof value !== "string") {
        throw new Error(
            `[TextField] Found value of type "${typeof value}" for field "${name}". Requires string (after decode)`
        );
    }

    return (
        <PolarisTextField
            id={name}
            error={error}
            disabled={isSubmitting}
            {...polarisProps}
            value={value}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
        />
    );
}

export default TextField;
