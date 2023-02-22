import React from "react";

const getSkeletonStyles = (isTranslucent, noLeading) => {
  const defaultBaseColor = "#eee";

  const defaultHighlightColor = "#f5f5f5";

  const skeletonStyles = {
    backgroundColor: isTranslucent ? "#C1C1C1" : defaultBaseColor,
    backgroundImage: isTranslucent
      ? `linear-gradient(-90deg, #C1C1C1 0%, #d0d0d0 50%, #C1C1C1 100%)`
      : `linear-gradient(-90deg, ${defaultBaseColor} 0%, ${defaultHighlightColor} 50%, ${defaultBaseColor} 100%)`,
    backgroundSize: "200px 100%",
    backgroundRepeat: "no-repeat",
    borderRadius: "4px",
    display: "inline-block",
    lineHeight: 1,
    width: "100%",
  };
  if (noLeading) delete skeletonStyles.lineHeight;

  return skeletonStyles;
};

export default function Skeleton({
  count,
  duration,
  width,
  wrapper: Wrapper,
  height,
  circle,
  style: customStyle,
  className: customClassName,
  noLeading,
  isTransparent,
  isLoading,
}) {
  const elements = [];

  for (let i = 0; i < count; i++) {
    let style = {};

    if (width !== null) {
      style.width = width;
    }

    if (height !== null) {
      style.height = height;
    }

    if (width !== null && height !== null && circle) {
      style.borderRadius = "50%";
    }

    let className = ""; //"react-loading-skeleton";
    if (customClassName) {
      className += " " + customClassName;
    }

    if (isLoading) {
      style.animation = `pulse ${duration}s ease-in-out infinite`;
    }

    elements.push(
      <span
        key={i}
        className={className}
        style={{
          ...getSkeletonStyles(isTransparent, noLeading),
          ...customStyle,
          ...style,
        }}
      >
        &zwnj;
      </span>
    );
  }

  return (
    <span>
      {Wrapper
        ? elements.map((element, i) => (
            <Wrapper key={i}>
              {element}
              &zwnj;
            </Wrapper>
          ))
        : elements}
    </span>
  );
}

Skeleton.defaultProps = {
  count: 1,
  duration: 1.2,
  width: null,
  wrapper: null,
  height: null,
  circle: false,
};
