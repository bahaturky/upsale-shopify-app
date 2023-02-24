/// <reference types="react" />
import { FieldValidator } from 'formik';
export interface UsePolarisFieldProps<V = any, T = V> {
    /**
     * The field identifier that formik can use to
     * connect this field to the data. Will also be
     * used as the polaris id
     */
    name: string;
    /**
     * Optional helper to convert from
     * non-string values to a string
     */
    decode?: (value: V) => T;
    /**
     * Optional helper to convert from
     * current string value to non-string value
     */
    encode?: (raw: T) => V;
    /**
     * Pass in a validation function to this field specifically
     */
    validate?: FieldValidator;
}
export declare function usePolarisField<V = any, T = V>(props: UsePolarisFieldProps<V, T>): {
    handleFocus: () => void;
    handleBlur: () => void;
    handleChange: (v: T) => void;
    value: V | T;
    isSubmitting: boolean;
    error: string | undefined;
    touched: boolean;
    initialValue?: V | undefined;
    initialTouched: boolean;
    initialError?: string | undefined;
    name: string;
    multiple?: boolean | undefined;
    checked?: boolean | undefined;
    onChange: {
        (e: import("react").ChangeEvent<any>): void;
        <T_1 = string | import("react").ChangeEvent<any>>(field: T_1): T_1 extends import("react").ChangeEvent<any> ? void : (e: string | import("react").ChangeEvent<any>) => void;
    };
    onBlur: {
        (e: import("react").FocusEvent<any>): void;
        <T_2 = any>(fieldOrEvent: T_2): T_2 extends string ? (e: any) => void : void;
    };
};
