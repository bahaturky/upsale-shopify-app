import React, { useCallback } from "react";
import {
  Card,
  ResourceList,
  Stack,
  TextStyle,
  Thumbnail,
  Icon,
  Tooltip,
} from "@shopify/polaris";
import { ViewMinor, HideMinor, DragHandleMinor } from "@shopify/polaris-icons";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
// import axios from "../../axios";

import useToastContext from "../../hooks/useToastContext";
// import { Router } from "../../../i18n";
import { useAuthenticatedFetch } from "../../hooks";
import { useNavigate, createSearchParams } from "@shopify/app-bridge-react";

function formatDate(date) {
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  };
  if (!Intl || !Intl.DateTimeFormat) {
    return date;
  }
  return new Intl.DateTimeFormat(undefined, options).format(new Date(date));
}

const noProductImg =
  "https://res.cloudinary.com/island/image/upload/v1626748982/no-product_cw8wg6.png";

const ListItem = ({
  index,
  item,
  deleteProduct,
  toggleProduct,
  t,
  navigate,
  ...rest
}) => (
  <Draggable draggableId={item.id} index={index}>
    {(provided, snapshot) => (
      <div
        className={
          snapshot.isDragging
            ? "shadow rounded border-2 border-gray-100"
            : index > 0
            ? "border-t border-gray-200"
            : ""
        }
        ref={provided.innerRef}
        {...provided.draggableProps}
        style={
          snapshot.isDragging
            ? {
                background: "white",
                ...provided.draggableProps.style,
              }
            : provided.draggableProps.style
        }
      >
        <ResourceList.Item
          {...rest}
          id={item.id}
          onClick={
            (id) => navigate(`/upsale/${id}`)
            // navigate({
            //     path
            // })
          }
        >
          <Stack alignment="center">
            <Stack.Item>
              <Thumbnail
                source={item.imageUrl || item.image || noProductImg}
                size="small"
                alt={item.title}
              />
            </Stack.Item>
            <Stack.Item fill>
              <div className="flex">
                <div className="mr-2" style={{ maxWidth: "13rem" }}>
                  <h3 className="truncate">
                    <TextStyle variation="strong">{item.title}</TextStyle>
                  </h3>
                </div>
              </div>
              <div className="inline-flex px-4 mt-3 leading-relaxed text-gray-600 bg-gray-100 rounded-lg">
                {item.targets && item.targets.includes("all")
                  ? t("all")
                  : item.targetsCount}{" "}
                {"products/collections"}
              </div>
            </Stack.Item>
            <Stack.Item>
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  toggleProduct(item.id);
                }}
              >
                {item.isActive ? (
                  <Icon source={ViewMinor} color="inkLightest" />
                ) : (
                  <Icon source={HideMinor} color="inkLightest" />
                )}
              </div>
            </Stack.Item>
            <Stack.Item>
              <div {...provided.dragHandleProps}>
                <Tooltip content={t("drag")}>
                  <Icon source={DragHandleMinor} color="inkLightest" />
                </Tooltip>
              </div>
            </Stack.Item>
          </Stack>
        </ResourceList.Item>
      </div>
    )}
  </Draggable>
);

const UpsalesList = ({ upsales, setUpsales, t }) => {
  const addToast = useToastContext();
  const fetch = useAuthenticatedFetch();
  const navigate = useNavigate();
  // Update positions of the upsales after user drag and drop one
  const handleDragEnd = useCallback(async ({ source, destination }) => {
    let newItems = [];
    setUpsales((oldItems) => {
      newItems = oldItems.slice(); // Duplicate
      const [draggedItem] = newItems.splice(source.index, 1);
      newItems.splice(destination.index, 0, draggedItem);
      newItems = newItems.map((item, i) => ({ ...item, position: i }));
      return newItems;
    });

    try {
      await fetch("/api/upsales/positions", {
        method: "post",
        body: JSON.stringify(
          newItems.map(({ id, position }) => ({ id, position }))
        ),
        headers: { "Content-Type": "application/json" },
      });
      // await axios.patch(`${HOST}`);
    } catch (err) {
      console.log("drag error", err);
    }
  }, []);

  const deleteProduct = (productId) => {
    setUpsales(upsales.filter((product) => product.id != productId));
  };

  // Toggle an upsale as active / unactive
  const toggleProduct = async (productId) => {
    try {
      let index = 0;
      let isActive = false;
      setUpsales((oldItems) =>
        oldItems.map((product, i) => {
          if (product.id === productId) {
            index = i;
            isActive = !product.isActive;
            return { ...product, isActive: !product.isActive };
          }
          return product;
        })
      );
      await fetch("/api/upsales/${productId}/toggle", {
        method: "post",
        body: JSON.stringify({}),
        headers: { "Content-Type": "application/json" },
      });
      // await axios.patch(`${HOST}`);

      addToast(
        `${t("common:upsell")} ${index + 1} ${
          isActive ? t("common:activated") : t("common:deactivated")
        }.`
      );
    } catch (err) {
      console.error("toggle error", err);
    }
  };

  return (
    <Card>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="root">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {upsales.map((item, index) => (
                <ListItem
                  key={item.id}
                  item={item}
                  index={index}
                  deleteProduct={deleteProduct}
                  toggleProduct={toggleProduct}
                  t={t}
                  navigate={navigate}
                />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </Card>
  );
};

export default UpsalesList;
