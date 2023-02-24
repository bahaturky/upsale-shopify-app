/// <reference types="react" />
import { TextFieldProps as PolarisTextFieldProps } from '@shopify/polaris';
import { UsePolarisFieldProps } from './usePolarisField';
import { Omit, OmittedPolarisProps } from './types';
declare type Props<V> = UsePolarisFieldProps<V, string> & PolarisTextFieldProps;
export declare type TextFieldProps<V = any> = Omit<Props<V>, OmittedPolarisProps>;
declare function TextField<V = any>(props: TextFieldProps<V>): JSX.Element;
export default TextField;
