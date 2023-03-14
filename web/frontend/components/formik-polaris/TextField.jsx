import React, { useEffect } from "react";
import { TextInputField } from "evergreen-ui";
import { usePolarisField } from "./usePolarisField";

// function TextField(props) {
//     console.log(props);
//     return <>Test</>
// }
function TextField(props) {
    const {
        name,
        encode,
        decode,
        validate,
        label,
        placeholder,
        helpText,
        ...polarisProps
    } = props;
    useEffect(() => {
        console.log("Text Fields");
    }, []);
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
        <TextInputField
            label={label}
            placeholder={placeholder}
            validationMessage={error}
            disabled={isSubmitting}
            {...polarisProps}
            value={value}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={(event) => {
                handleChange(event.target.value)
            }}
            hint={helpText}
        />
    );
}

export default TextField;
