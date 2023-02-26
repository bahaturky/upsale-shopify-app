import React, { memo, useMemo, useState } from "react";
import ExpandedUpsale from "../components/ExpandedUpsale";
import ExpandUpsaleContext from "../contexts/ExpandUpsaleContext";

const ExpandedUpsaleProvider = memo(function ExpandedUpsaleProvider({
    children,
    items,
    ...props
}) {
    const [expandedUpsaleId, setExpandedUpsaleId] = useState(null);
    const expandedUpsale = useMemo(
        () => expandedUpsaleId && items.find((i) => i.id === expandedUpsaleId),
        [items, expandedUpsaleId]
    );

    return (
        <ExpandUpsaleContext.Provider value={setExpandedUpsaleId}>
            {expandedUpsale ? (
                <ExpandedUpsale upsale={expandedUpsale} {...props} />
            ) : (
                children
            )}
        </ExpandUpsaleContext.Provider>
    );
});

export default ExpandedUpsaleProvider;
