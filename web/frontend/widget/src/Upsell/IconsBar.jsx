import React from "react";

const IconsBar = ({
  settings
}) => {
  const sections = [];

  if (settings.iconsBarLeft) {
    sections.push(settings.iconsBarLeft);
  }

  if (settings.iconsBarRight) {
    sections.push(settings.iconsBarRight);
  }

  const sectionsEl = sections.map((section, i) =>
    <div
      className="text-center"
      key={i}
    >{section}</div>
  );

  return (
    <div
      className={
        `w-full p-2 text-xs bg-white font-medium text-center text-black
          grid grid-cols-${sections.length}
      `}
    >
      {sectionsEl}
    </div>
  );
};

export default IconsBar;
