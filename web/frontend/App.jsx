import { BrowserRouter } from "react-router-dom";
import { NavigationMenu } from "@shopify/app-bridge-react";
import Routes from "./Routes";

import {
    AppBridgeProvider,
    QueryProvider,
    PolarisProvider,
} from "./components";
import { useEffect } from "react";
import { ToastContextProvider } from "./contexts/ToastContext";

export default function App() {
    // Any .tsx or .jsx files in /pages will become a route
    // See documentation for <Routes /> for more info
    useEffect(() => {
        (function () {
            var d = document;
            var s = d.createElement("script");

            s.src = "https://client.crisp.chat/l.js";
            s.async = 1;
            d.getElementsByTagName("head")[0].appendChild(s);
        })();
    }, []);
    const pages = import.meta.globEager(
        "./pages/**/!(*.test.[jt]sx)*.([jt]sx)"
    );

    return (
        <PolarisProvider>
            <BrowserRouter>
                <AppBridgeProvider>
                    <QueryProvider>
                        <ToastContextProvider>
                            <NavigationMenu
                                navigationLinks={[
                                    {
                                        label: "Dashboard",
                                        destination: "/",
                                    },
                                    {
                                        label: "New Upsell",
                                        destination: "/upsell/new",
                                    },
                                    {
                                        label: "Settings",
                                        destination: "/settings",
                                    },
                                    {
                                        label: "FAQ",
                                        destination: "/questions",
                                    },
                                ]}
                            />
                            <Routes pages={pages} />
                        </ToastContextProvider>
                    </QueryProvider>
                </AppBridgeProvider>
            </BrowserRouter>
        </PolarisProvider>
    );
}
