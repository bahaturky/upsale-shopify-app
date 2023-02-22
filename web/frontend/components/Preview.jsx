import React from "react";
import Frame from "react-frame-component";

import Upsell from "../widget/src/Upsell";
import { DEFAULT_SETTINGS } from "../widget/src/constants";

const Preview = ({ upsales, shop, device, className, sticky }) => {
  // to get money format in preview
  if (typeof window !== "undefined") window.islandUpsell = { shop };

  const smallScreen = window.innerWidth <= 760;

  if (smallScreen) {
    device = "mobile";
  }

  const ratio = device === "mobile" ? 1.6 : 1.8;

  return (
    <div
      className="frame-container"
      style={{
        position: smallScreen ? "static" : "absolute",
        marginLeft: smallScreen ? (sticky ? "2rem" : 0) : (device === "desktop" ? "370px" : "350px"),
        height: sticky ? '100%' : 'auto',
        top: 0,
        left: 0
      }}
    >
      <div
        className={`pb-12 flex flex-1 flex-col items-center
          ${ device === "desktop" ? "bg-yellow-50 justify-center" : "" }
          ${ className ? className : "" }
        `}
        style={
          device === "desktop" ? {
            width: "1280px",
            height: "1024px",
            transform: "scale(0.44)",
            transformOrigin: "0 0",
            borderTop: "30px solid #d2d7e4",
            borderRadius: "12px"
          } : {
            width: smallScreen ? "100%" : "584px",
            marginTop: sticky ? (smallScreen ? "1.5rem" : "2rem") : (smallScreen ? "1.5rem" : 0)
          }
        }
      >
        <div
          style={{
            width: device === "mobile" ? Math.round(ratio * 228) : Math.round(ratio * 250) + "px",
            height: Math.round(ratio * 463) + "px",
          }}
        >
          <div
            className={`flex justify-center w-full bg-gray-100`}
            style={{
              height: "100%",
              top: 0,
              border: device === "mobile" ? "10px solid #d2d7e4" : "none",
              borderRadius: "12px"
            }}
          >
            <Frame
              title="preview"
              className="absolute top-0 left-0 w-full border-0"
              style={{
                height: "100%"
              }}
              head={
                <>
                  <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
                  <link
                    rel="stylesheet"
                    href={`${HOST}/widget/build/index-prod.css`}
                  />
                  {shop && shop.settings && !!shop.settings.customCSS && (
                    <style>{shop.settings.customCSS}</style>
                  )}
                </>
              }
            >
              <Upsell
                verified={shop.isAppVerified}
                handleClose={null}
                settings={
                  shop && shop.settings
                    ? { ...DEFAULT_SETTINGS, ...shop.settings }
                    : DEFAULT_SETTINGS
                }
                product={null}
                isPreview={true}
                upsales={upsales}
                currency={shop.currency}
              />
            </Frame>
          </div>
        </div>
        <style jsx>{`
          position: sticky;
          top: 15px;
        `}</style>
      </div>
    </div>
  );
};

export default Preview;
