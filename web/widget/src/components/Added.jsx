import React from "react";

const Added = ({ settings, alignment = 'left', size = 'md' }) => (
  <div
    className={
      `flex items-center
      ${ alignment === 'center' ? "justify-center" : "" }
    `}
  >
    <div
      className={
        `font-medium tracking-wider text-green-400
        ${ size === 'xs' ? "text-xs xs:text-xs sm:text-xs" : "text-xl" }
      `}
      style={{ color: settings.primaryColor.hex }}
    >
      {settings.addedText}
    </div>
  </div>
);

export default Added;
