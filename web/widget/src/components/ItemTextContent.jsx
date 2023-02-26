import React from "react";
import Skeleton from "./Skeleton";

export default ({ item, alignment, size = "md", displayDescription = true }) => (
  <>
    <div
      className={`font-medium text-gray-700
         ${size === "md" ? "text-md sm:text-lg md:text-xl leading-5 sm:leading-6" : "text-xs md:text-sm"}
         ${item ? "" : "w-2/3 "}
         ${alignment === "center" ? "text-center" : ""}
      `}
    >
      {item ? item.title : <Skeleton />}
    </div>
    {((item && !!item.desc) || !item) && displayDescription && (
      <div
        className={`mt-2 text-xs xs:text-sm sm:text-md leading-4 text-gray-500
           ${alignment === "center" ? "text-center" : ""}
        `}
      >
        {item ? item.desc : <Skeleton />}
      </div>
    )}
  </>
);
