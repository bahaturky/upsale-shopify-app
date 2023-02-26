import React from "react";

export default ({ shape, isSelected, item, selectVariant, size }) =>
  item && item.variants && item.variants.length > 1 ? (
    <div className="text-center" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "100%" }}>
      <select
        className={
          `form-select inline-flex border-gray-300 focus:outline-none focus:shadow-none focus:border-blue-300
            ${ shape === 'square' ? "rounded-none" : "" }
            ${ size === 'xs' ? "text-xs px-3 py-1" : "px-4 py-1 text-xs xs:text-sm leading-5 xs:leading-6" }
          `}
        style={{
          backgroundPosition: "right 0.25rem center",
          overflow: "hidden",
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
          maxWidth: "100%",
          paddingRight: 24,
          marginTop: 5
        }}
        onChange={(option) => selectVariant(item, option.target.value)}
        value={item.selectedVariant || item.variants[0].id}
        disabled={isSelected}
      >
        {item.variants.map((v) => (
          <option key={v.id} value={v.id}>
            {v.title}
          </option>
        ))}
      </select>
    </div>
  ) : null;
