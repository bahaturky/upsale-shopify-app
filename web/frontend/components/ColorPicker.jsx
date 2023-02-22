import React, { useState } from "react";
import * as P from "@shopify/polaris";
import tinycolor from "tinycolor2";
import { useField } from "formik";
import { DEFAULT_SETTINGS } from "../widget/src/constants";

const ColorPicker = ({ name, label, restoreDefaultText }) => {
    const [isOpen, setPopup] = useState(false);
    const [field, meta, helpers] = useField(name);
    const { setValue } = helpers;

    const restoreDefault = () => setValue(DEFAULT_SETTINGS[field.name]);
    return (
        <P.FormLayout>
            <div className="relative">
                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 overflow-auto"
                            onClick={() => setPopup(!isOpen)}
                        />
                        <div className="absolute mt-28 top-0 right-0 z-30">
                            <P.Card sectioned>
                                <P.ColorPicker
                                    color={field.value.hsl}
                                    onChange={(c) => {
                                        setValue({
                                            hsl: c,
                                            hex: tinycolor({
                                                h: c.hue,
                                                s: c.saturation,
                                                l: c.brightness,
                                            }).toHexString(),
                                        });
                                    }}
                                />
                            </P.Card>
                        </div>
                    </>
                )}
                <div className="Polaris-Labelled__LabelWrapper">
                    <div className="Polaris-Label">
                        <label
                            id="PolarisTextField1Label"
                            htmlFor="PolarisTextField1"
                            className="Polaris-Label__Text"
                        >
                            {label}
                        </label>
                    </div>
                    <div
                        onClick={restoreDefault}
                        className="cursor-pointer text-indigo-500 hover:underline"
                    >
                        {restoreDefaultText}
                    </div>
                </div>
                <div className="Polaris-Connected">
                    <div className="Polaris-Connected__Item Polaris-Connected__Item--primary">
                        <div className="Polaris-TextField Polaris-TextField--hasValue">
                            <input
                                id="PolarisTextField1"
                                className="Polaris-TextField__Input"
                                aria-labelledby="PolarisTextField1Label"
                                aria-invalid="false"
                                aria-multiline="false"
                                value={field.value.hex}
                                onChange={(e) => {
                                    const c = e.target.value;
                                    const hsl = tinycolor(c).toHsl();
                                    setValue({
                                        hsl: {
                                            hue: hsl.h,
                                            saturation: hsl.s,
                                            brightness: hsl.l,
                                        },
                                        hex: c,
                                    });
                                }}
                            />
                            <div
                                className="rounded-md z-20 border border-gray-400 cursor-pointer"
                                style={{
                                    width: "2rem",
                                    height: "2rem",
                                    marginRight: "0.8rem",
                                }}
                                onClick={() => setPopup(!isOpen)}
                            >
                                <div
                                    className="rounded-md border-2 border-white"
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        backgroundColor: field.value.hex,
                                    }}
                                ></div>
                            </div>
                            <div className="Polaris-TextField__Backdrop"></div>
                        </div>
                    </div>
                </div>
            </div>
        </P.FormLayout>
    );
};

export default ColorPicker;
