/// <reference types="react" />
import { CheckboxProps as PolarisCheckboxProps } from '@shopify/polaris';
import { UsePolarisFieldProps } from './usePolarisField';
import { Omit, OmittedPolarisProps } from './types';
declare type Props<V> = UsePolarisFieldProps<V, boolean> & PolarisCheckboxProps;
export declare type CheckboxProps<V> = Omit<Props<V>, OmittedPolarisProps>;
declare function CheckboxField<V = any>(props: CheckboxProps<V>): JSX.Element;
export default CheckboxField;
