/// <reference types="react" />
import { RangeSliderProps as PolarisRangeSliderProps } from '@shopify/polaris';
import { UsePolarisFieldProps } from './usePolarisField';
import { Omit, OmittedPolarisProps } from './types';
export declare type RangeSliderValue = PolarisRangeSliderProps['value'];
declare type Props<V> = UsePolarisFieldProps<V, RangeSliderValue> & PolarisRangeSliderProps;
export declare type RangeSliderProps<V = any> = Omit<Props<V>, OmittedPolarisProps>;
declare function RangeSlider<V = any>(props: RangeSliderProps<V>): JSX.Element;
export default RangeSlider;
