import { useEffect, useContext } from "react";
import {
    Context as AppBridgeContext,
    RoutePropagator as ShopifyRoutePropagator,
    useNavigate
} from "@shopify/app-bridge-react";

import { Redirect } from "@shopify/app-bridge/actions";
// import {  } from "react-router-dom";

// import { useRouter } from "next/router";
// import { useRouter } from "../hooks/useRouter";
// import { Router } from "../../i18n";

const RoutePropagator = ({ app }) => {
    const router = useNavigate();
    const { route, asPath } = router;
    const appBridge = useContext(AppBridgeContext);

    useEffect(() => {
        appBridge.subscribe(Redirect.Action.APP, ({ path }) => {
            router(`${path}?shop=${window.shopOrigin}`);
        });
    }, []);

    return appBridge && route ? (
        <ShopifyRoutePropagator location={asPath} app={appBridge} />
    ) : null;
};

export default RoutePropagator;
