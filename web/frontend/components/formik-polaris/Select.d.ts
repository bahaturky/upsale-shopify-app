/// <reference types="react" />
import { SelectProps as PolarisSelectProps } from '@shopify/polaris';
import { Omit, OmittedPolarisProps } from './types';
import { UsePolarisFieldProps } from './usePolarisField';
declare type Props<V> = UsePolarisFieldProps<V, string | undefined> & PolarisSelectProps;
export declare type SelectProps<V> = Omit<Props<V>, OmittedPolarisProps>;
declare function SelectField<V = any>(props: SelectProps<V>): JSX.Element;
export default SelectField;
