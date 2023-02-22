import React, { useState, createContext } from "react";
import { Toast } from "@shopify/app-bridge-react";

const ToastContext = createContext();
const IS_OFFLINE = process.env.IS_OFFLINE || false;
export default ToastContext;

// This is the notification that appear after user do some action like creating a new upsale
export function ToastContextProvider({ children }) {
    const [toast, setToast] = useState(null);

    const addToast = (msg) => {
        if (toast) setToast(null);
        setToast(msg);
    };

    return (
        <ToastContext.Provider value={addToast}>
            {children}
            <div>
                {!IS_OFFLINE && toast && (
                    <Toast content={toast} onDismiss={() => setToast(null)} />
                )}
            </div>
        </ToastContext.Provider>
    );
}
