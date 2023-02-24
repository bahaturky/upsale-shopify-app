'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var React = require('react');
var React__default = _interopDefault(React);
var polaris = require('@shopify/polaris');
var formik = require('formik');

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

  var _useFormikContext = formik.useFormikContext(),
      registerField = _useFormikContext.registerField,
      unregisterField = _useFormikContext.unregisterField,
      getFieldProps = _useFormikContext.getFieldProps,
      getFieldMeta = _useFormikContext.getFieldMeta,
      isSubmitting = _useFormikContext.isSubmitting,
      setFieldError = _useFormikContext.setFieldError,
      setFieldValue = _useFormikContext.setFieldValue;

  React.useEffect(function () {
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
  var value = React.useMemo(function () {
    return decode ? decode(field.value) : field.value;
  }, [decode, field.value]);
  var handleFocus = React.useCallback(function () {
    setFieldError(name, '');
  }, [name, setFieldError]);
  var handleBlur = React.useCallback(function () {
    field.onBlur({
      target: {
        name: name
      }
    });
  }, [field, name]);
  var handleChange = React.useCallback(function (v) {
    setFieldValue(name, encode ? encode(v) : v);
  }, [encode, name, setFieldValue]);
  var error = React.useMemo(function () {
    if (meta.error && meta.touched) {
      return meta.error;
    }

    return undefined;
  }, [meta.error, meta.touched]);
  return React.useMemo(function () {
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

  return React__default.createElement(polaris.Checkbox, Object.assign({
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

  return React__default.createElement(polaris.Select, Object.assign({
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

  return React__default.createElement(polaris.TextField, Object.assign({
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

  return React__default.createElement(polaris.RangeSlider, Object.assign({
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

exports.Checkbox = CheckboxField;
exports.RangeSlider = RangeSlider;
exports.Select = SelectField;
exports.TextField = TextField;
exports.usePolarisField = usePolarisField;
//# sourceMappingURL=formik-polaris.cjs.development.js.map
