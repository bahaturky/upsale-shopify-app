import { Thumbnail, Labelled, TextStyle, Spinner } from "@shopify/polaris";
import { useField } from "formik";
import { useCallback, useState } from "react";
import { useAuthenticatedFetch } from "../hooks";
// import axios from "../axios";

const placeholder =
    "https://res.cloudinary.com/island/image/upload/v1626748982/no-product_cw8wg6.png";

function ImagePicker({ name, label, upsaleId }) {
    const [{ value }, , { setValue }] = useField(name);
    const [uploading, setUploading] = useState(false);
    const fetch = useAuthenticatedFetch();

    const onUpload = useCallback(async (file) => {
        setUploading(true);

        try {
            const { url, imageUrl } = await fetch(
                `/api/upsales/${upsaleId}/image`,
                {
                    method: "PUT",
                    body: JSON.stringify({
                        fileName: file.name,
                        contentType: file.type,
                    }),
                    headers: {
                        "Content-type": "application/json",
                    },
                }
            );
            await window.fetch(url, {
                method: "PUT",
                headers: { "x-amz-acl": "public-read" },
                body: file,
            });

            setValue(imageUrl);
        } catch (e) {
            console.error(e);
        }

        setUploading(false);
    }, []);

    const onDragOver = useCallback((e) => {
        e.preventDefault();
    }, []);

    const onDrop = useCallback(
        (e) => {
            e.preventDefault();
            e.stopPropagation();

            let file;

            if (e.dataTransfer.items) {
                for (var i = 0; i < e.dataTransfer.items.length; i++) {
                    if (e.dataTransfer.items[i].kind === "file") {
                        file = e.dataTransfer.items[i].getAsFile();
                        break;
                    }
                }
            } else {
                for (var i = 0; i < e.dataTransfer.files.length; i++) {
                    file = e.dataTransfer.files[i];
                    break;
                }
            }

            if (file) {
                onUpload(file);
            }
        },
        [upsaleId, onUpload]
    );

    const onChange = useCallback((e) => {
        onUpload(e.target.files[0]);
    }, []);

    return (
        <div
            style={{ display: "flex", alignItems: "center" }}
            {...{ onDragOver, onDrop }}
        >
            <label
                style={{
                    position: "relative",
                    marginRight: 20,
                    cursor: "pointer",
                }}
            >
                <Thumbnail source={value || placeholder} size="large" />

                <div
                    style={{
                        opacity: uploading ? 1 : 0,
                        position: "absolute",
                        backgroundColor: "rgba(255, 255, 255, 0.5)",
                        zIndex: 999,
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Spinner />
                </div>

                <input
                    type="file"
                    {...{ onChange }}
                    style={{
                        visibility: "hidden",
                        position: "fixed",
                        left: -9999,
                        width: 1,
                    }}
                />
            </label>

            <TextStyle variation="subdued">
                We will use your product page unless you want to use another
                specific image
            </TextStyle>
        </div>
    );
}

export default ImagePicker;
