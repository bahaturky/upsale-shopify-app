import React from "react";

import { Skeleton } from ".";

const noProductImg = "https://res.cloudinary.com/island/image/upload/v1626748982/no-product_cw8wg6.png";

const ItemImage = ({ item, shape }) => {
  let image = item?.imageUrl || item?.image || noProductImg || null;

  if (item) {
    const { selectedVariant = item.variants[0]?.id } = item;
    const variant = item.variants.find((v) => v.id === selectedVariant);

    image = item?.imageUrl || (variant && variant.image ? variant.image.transformedSrc || variant.image.originalSrc : item.image);
  }

  const shapeToClass = {
    square : '',
    halfRounded : 'rounded-md',
    rounded : 'rounded-full'
  }

  return (
    <div
      className={`h-20 w-20 xs:h-24 xs:w-24 ${ shapeToClass[shape] } flex-shrink-0 overflow-hidden bg-white`}
    >
      {item ? (
        <img
          className="object-cover w-full h-full"
          src={image}
          alt={item.title}
        />
      ) : (
        <Skeleton className="h-full" noLeading={true} />
      )}
    </div>
  );
};

export default ItemImage;
