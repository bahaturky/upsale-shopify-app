import React, { useEffect, useMemo, useCallback } from 'react';
import { Checkbox, Select, TextField as TextField$1, RangeSlider as RangeSlider$1 } from '@shopify/polaris';
import { useFormikContext } from 'formik';

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

function usePolarisField(props) {
  var name = props.name,
      encode = props.encode,
      decode = props.decode,
      validate = props.validate; // Modified from https://github.com/jaredpalmer/formik/blob/5553720b5d6c9729cb3b12fd7948f28ad3be9adc/src/Field.tsx#L74

  var _useFormikContext = useFormikContext(),
      registerField = _useFormikContext.registerField,
      unregisterField = _useFormikContext.unregisterField,
      getFieldProps = _useFormikContext.getFieldProps,
      getFieldMeta = _useFormikContext.getFieldMeta,
      isSubmitting = _useFormikContext.isSubmitting,
      setFieldError = _useFormikContext.setFieldError,
      setFieldValue = _useFormikContext.setFieldValue;

  useEffect(function () {
    if (name) {
      registerField(name, {
        validate: validate
      });
    }

    return function () {
      if (name) {
        unregisterField(name);
      }
    };
  }, [name, registerField, unregisterField, validate]);
  var field = getFieldProps({
    name: name
  });
  var meta = getFieldMeta(name);
  var value = useMemo(function () {
    return decode ? decode(field.value) : field.value;
  }, [decode, field.value]);
  var handleFocus = useCallback(function () {
    setFieldError(name, '');
  }, [name, setFieldError]);
  var handleBlur = useCallback(function () {
    field.onBlur({
      target: {
        name: name
      }
    });
  }, [field, name]);
  var handleChange = useCallback(function (v) {
    setFieldValue(name, encode ? encode(v) : v);
  }, [encode, name, setFieldValue]);
  var error = useMemo(function () {
    if (meta.error && meta.touched) {
      return meta.error;
    }

    return undefined;
  }, [meta.error, meta.touched]);
  return useMemo(function () {
    return _extends({}, field, meta, {
      handleFocus: handleFocus,
      handleBlur: handleBlur,
      handleChange: handleChange,
      value: value,
      isSubmitting: isSubmitting,
      error: error
    });
  }, [error, field, handleBlur, handleChange, handleFocus, isSubmitting, meta, value]);
}

function CheckboxField(props) {
  var name = props.name,
      encode = props.encode,
      decode = props.decode,
      validate = props.validate,
      polarisProps = _objectWithoutPropertiesLoose(props, ["name", "encode", "decode", "validate"]);

  var _usePolarisField = usePolarisField({
    name: name,
    encode: encode,
    decode: decode,
    validate: validate
  }),
      rawValue = _usePolarisField.value,
      isSubmitting = _usePolarisField.isSubmitting,
      handleFocus = _usePolarisField.handleFocus,
      handleBlur = _usePolarisField.handleBlur,
      handleChange = _usePolarisField.handleChange,
      error = _usePolarisField.error;

  var value = rawValue === undefined ? false : rawValue;

  if (typeof value !== 'boolean') {
    throw new Error("[Checkbox] Found value of type \"" + typeof value + "\" for field \"" + name + "\". Requires boolean (after decode)");
  }

  return React.createElement(Checkbox, Object.assign({
    id: name,
    error: error,
    disabled: isSubmitting
  }, polarisProps, {
    checked: value,
    onFocus: handleFocus,
    onBlur: handleBlur,
    onChange: handleChange
  }));
}

function SelectField(props) {
  var name = props.name,
      encode = props.encode,
      decode = props.decode,
      validate = props.validate,
      polarisProps = _objectWithoutPropertiesLoose(props, ["name", "encode", "decode", "validate"]);

  var _usePolarisField = usePolarisField({
    name: name,
    encode: encode,
    decode: decode,
    validate: validate
  }),
      value = _usePolarisField.value,
      isSubmitting = _usePolarisField.isSubmitting,
      handleFocus = _usePolarisField.handleFocus,
      handleBlur = _usePolarisField.handleBlur,
      handleChange = _usePolarisField.handleChange,
      error = _usePolarisField.error;

  if (typeof value !== 'string' && value !== undefined) {
    throw new Error("[Select] Found value of type \"" + typeof value + "\" for field \"" + name + "\". Requires string (after decode)");
  }

  return React.createElement(Select, Object.assign({
    id: name,
    error: error,
    disabled: isSubmitting
  }, polarisProps, {
    value: value,
    onFocus: handleFocus,
    onBlur: handleBlur,
    onChange: handleChange
  }));
}

function TextField(props) {
  var name = props.name,
      encode = props.encode,
      decode = props.decode,
      validate = props.validate,
      polarisProps = _objectWithoutPropertiesLoose(props, ["name", "encode", "decode", "validate"]);

  var _usePolarisField = usePolarisField({
    name: name,
    encode: encode,
    decode: decode,
    validate: validate
  }),
      rawValue = _usePolarisField.value,
      isSubmitting = _usePolarisField.isSubmitting,
      handleFocus = _usePolarisField.handleFocus,
      handleBlur = _usePolarisField.handleBlur,
      handleChange = _usePolarisField.handleChange,
      error = _usePolarisField.error;

  var value = rawValue === undefined ? '' : rawValue;

  if (typeof value !== 'string') {
    throw new Error("[TextField] Found value of type \"" + typeof value + "\" for field \"" + name + "\". Requires string (after decode)");
  }

  return React.createElement(TextField$1, Object.assign({
    id: name,
    error: error,
    disabled: isSubmitting
  }, polarisProps, {
    value: value,
    onFocus: handleFocus,
    onBlur: handleBlur,
    onChange: handleChange
  }));
}

function RangeSlider(props) {
  var name = props.name,
      encode = props.encode,
      decode = props.decode,
      validate = props.validate,
      polarisProps = _objectWithoutPropertiesLoose(props, ["name", "encode", "decode", "validate"]);

  var _usePolarisField = usePolarisField({
    name: name,
    encode: encode,
    decode: decode,
    validate: validate
  }),
      rawValue = _usePolarisField.value,
      isSubmitting = _usePolarisField.isSubmitting,
      handleFocus = _usePolarisField.handleFocus,
      handleBlur = _usePolarisField.handleBlur,
      handleChange = _usePolarisField.handleChange,
      error = _usePolarisField.error;

  var value = rawValue === undefined ? '' : rawValue;

  if (typeof value !== 'number' && !Array.isArray(value)) {
    throw new Error("[RangeSlider] Found value of type \"" + typeof value + "\" for field \"" + name + "\". Requires number or [number, number] (after decode)");
  }

  return React.createElement(RangeSlider$1, Object.assign({
    id: name,
    error: error,
    disabled: isSubmitting
  }, polarisProps, {
    value: value,
    onFocus: handleFocus,
    onBlur: handleBlur,
    onChange: handleChange
  }));
}

export { CheckboxField as Checkbox, RangeSlider, SelectField as Select, TextField, usePolarisField };
//# sourceMappingURL=formik-polaris.esm.js.map
