import React, { useState, useEffect } from "react";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import ProductPicker from "./ProductPicker";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

function ProductList({ selectedProductsList, setSelectedProductsList }) {
  const [discountButtons, setDiscountButtons] = useState([
    new Array(selectedProductsList.length).fill(true),
  ]);
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [showVariants, setShowVariants] = useState([]);
  const [pickerIndex, setPickerIndex] = useState();
  const [variantDiscountButtons, setVariantDiscountButtons] = useState([]);

  useEffect(() => {
    setDiscountButtons(() => {
      const newButtons = new Array(selectedProductsList.length).fill(true);
      return newButtons;
    });

    setShowVariants(() => {
      const Variants = new Array(selectedProductsList.length).fill(true);
      return Variants;
    });

    setVariantDiscountButtons(() => {
      const newButtons = selectedProductsList.map((product) =>
        product ? new Array(product.variants.length).fill(false) : []
      );
      return newButtons;
    });
  }, [selectedProductsList]);

  const toggleVisibility = (func, index) => {
    func((prev) =>
      prev.map((discount, i) => (i === index ? !discount : discount))
    );
  };

  const toggleVariantVisibility = (productIndex, variantIndex) => {
    setVariantDiscountButtons((prev) => {
      const newButtons = [...prev];
      // newButtons[productIndex] = [...newButtons[productIndex]];
      newButtons[productIndex][variantIndex] =
        !newButtons[productIndex][variantIndex];
      return newButtons;
    });
  };

  const reorderArray = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  const handleDragDrop = (results) => {
    const { source, destination, type } = results;

    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;

    if (type === "ProductGroup") {
      const reorderedProducts = reorderArray(
        selectedProductsList,
        source.index,
        destination.index
      );
      const reorderedDiscountButtons = reorderArray(
        discountButtons,
        source.index,
        destination.index
      );
      const reorderedVariantDiscountButtons = reorderArray(
        variantDiscountButtons,
        source.index,
        destination.index
      );

      setSelectedProductsList(reorderedProducts);
      setDiscountButtons(reorderedDiscountButtons);
      setVariantDiscountButtons(reorderedVariantDiscountButtons);
    }

    if (type === "VariantGroup") {
      const productIndex = parseInt(source.droppableId.split("-")[1], 10);
      const updatedProducts = [...selectedProductsList];
      const [movedVariant] = updatedProducts[productIndex].variants.splice(
        source.index,
        1
      );
      updatedProducts[productIndex].variants.splice(
        destination.index,
        0,
        movedVariant
      );

      const updatedVariantDiscountButtons = [...variantDiscountButtons];
      const [movedVariantButton] = updatedVariantDiscountButtons[
        productIndex
      ].splice(source.index, 1);
      updatedVariantDiscountButtons[productIndex].splice(
        destination.index,
        0,
        movedVariantButton
      );

      setSelectedProductsList(updatedProducts);
      setVariantDiscountButtons(updatedVariantDiscountButtons);
    }
  };

  const removeProduct = (index) => {
    const updatedProducts = selectedProductsList.filter((_, i) => i !== index);
    const updatedDiscountButtons = discountButtons.filter(
      (_, i) => i !== index
    );
    const updatedVariantDiscountButtons = variantDiscountButtons.filter(
      (_, i) => i !== index
    );

    setSelectedProductsList(updatedProducts);
    setDiscountButtons(updatedDiscountButtons);
    setVariantDiscountButtons(updatedVariantDiscountButtons);
  };

  const removeVariant = (productIndex, variantIndex) => {
    const updatedProducts = [...selectedProductsList];
    const updatedVariants = updatedProducts[productIndex].variants.filter(
      (_, i) => i !== variantIndex
    );
    updatedProducts[productIndex].variants = updatedVariants;

    const updatedVariantDiscountButtons = [...variantDiscountButtons];
    updatedVariantDiscountButtons[productIndex] = updatedVariantDiscountButtons[
      productIndex
    ].filter((_, i) => i !== variantIndex);

    setSelectedProductsList(updatedProducts);
    setVariantDiscountButtons(updatedVariantDiscountButtons);
  };

  const VariantPlaceHolder = ({
    variantObj,
    ifClose,
    variantIndex,
    productIndex,
  }) => {
    return (
      <Draggable
        draggableId={`variant-${productIndex}-${variantIndex}`}
        index={variantIndex}
      >
        {(provided) => (
          <div
            {...provided.draggableProps}
            ref={provided.innerRef}
            className="mt-1 mb-2 flex flex-col gap-3"
          >
            <div className="ml-14 flex gap-2 items-center">
              <div {...provided.dragHandleProps}>
                <DragIndicatorIcon className="text-gray-500" />
              </div>
              <div className="bg-white shadow-md rounded-3xl overflow-hidden h-11 w-80 flex items-center p-4 justify-between">
                <p className="bg-white text-gray-700">{variantObj.title}</p>
              </div>
              {variantDiscountButtons[productIndex][variantIndex] ? (
                <div className="flex gap-3">
                  <input
                    type="number"
                    className="bg-white shadow-md  hover:border cursor-pointer overflow-hidden h-11 w-16 flex items-center p-4 justify-between focus-visible:outline focus-visible:outline-2 focus-visible:outline-green-700"
                  />
                  <select
                    id="Discount"
                    className="bg-white shadow-md cursor-pointer overflow-hidden h-11 w-24 flex items-center pl-3 justify-between focus-visible:outline focus-visible:outline-2 focus-visible:outline-green-700"
                  >
                    <option value="% off">% Off</option>
                    <option value="Flat off">Flat Off</option>
                  </select>
                </div>
              ) : (
                <button
                  onClick={() =>
                    toggleVariantVisibility(productIndex, variantIndex)
                  }
                  className="cursor-pointer w-32 bg-[#007555] px-3.5 py-2.5 text-m font-semibold text-white shadow-sm hover:bg-green-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  Add Discount
                </button>
              )}
              {ifClose && (
                <CloseIcon
                  className="text-gray-500 cursor-pointer"
                  onClick={() => removeVariant(productIndex, variantIndex)}
                />
              )}
            </div>
          </div>
        )}
      </Draggable>
    );
  };

  const ProductPlaceHolder = ({ productObj, index, ifClose }) => {
    return (
      <Draggable draggableId={`product-${index}`} index={index}>
        {(provided) => (
          <div
            {...provided.draggableProps}
            ref={provided.innerRef}
            className="flex flex-col gap-1"
          >
            <div className="flex gap-2 items-center">
              <div {...provided.dragHandleProps}>
                <DragIndicatorIcon className="text-gray-500" />
              </div>
              <div>{index + 1}.</div>
              <div className="bg-white shadow-md rounded-lg overflow-hidden h-11 w-80 flex items-center p-4 justify-between">
                <p
                  className={` bg-white ${
                    productObj === null ? "text-gray-500" : "text-gray-900"
                  }`}
                >
                  {productObj === null ? "Select Product" : productObj.title}
                </p>
                <EditIcon
                  onClick={() => {
                    setShowProductPicker(true);
                    setPickerIndex(index);
                  }}
                  className={`bg-white cursor-pointer ${
                    !productObj
                      ? "text-green-700 h-full hover:text-green-500"
                      : "text-gray-400 hover:text-gray-300"
                  }`}
                />
              </div>
              {discountButtons[index] ? (
                <button
                  onClick={() => {
                    toggleVisibility(setDiscountButtons, index);
                  }}
                  className="cursor-pointer w-32  bg-[#007555] px-3.5 py-2.5 text-m font-semibold text-white shadow-sm hover:bg-green-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  Add Discount
                </button>
              ) : (
                <div className="flex gap-3">
                  <input
                    type="number"
                    className="bg-white shadow-md  hover:border cursor-pointer overflow-hidden h-11 w-16 flex items-center p-4 justify-between focus-visible:outline focus-visible:outline-2 focus-visible:outline-green-700"
                  />
                  <select
                    id="Discount"
                    className="bg-white shadow-md  cursor-pointer overflow-hidden h-11 w-24 flex items-center pl-3 justify-between focus-visible:outline focus-visible:outline-2 focus-visible:outline-green-700"
                  >
                    <option value="% off">% Off</option>
                    <option value="Flat off">Flat Off</option>
                  </select>
                </div>
              )}
              {ifClose && (
                <CloseIcon
                  className="text-gray-500 cursor-pointer"
                  onClick={() => {
                    removeProduct(index);
                  }}
                />
              )}
            </div>
            {productObj && productObj.variants.length > 1 && (
              <div className="flex mt-2 w-8/12 justify-end">
                <button
                  onClick={() => {
                    toggleVisibility(setShowVariants, index);
                  }}
                  className="font-semibold text-sm underline text-blue-500"
                >
                  {showVariants[index] ? (
                    <p>
                      Hide Variants
                      <KeyboardArrowUpIcon />
                    </p>
                  ) : (
                    <p>
                      Show Variants <KeyboardArrowDownIcon />
                    </p>
                  )}
                </button>
              </div>
            )}
            {productObj &&
              productObj.variants.length > 0 &&
              showVariants[index] && (
                <Droppable
                  droppableId={`variants-${index}`}
                  type="VariantGroup"
                >
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="mt-2"
                    >
                      {productObj.variants.map((variant, variantIndex) => (
                        <VariantPlaceHolder
                          key={variantIndex}
                          variantObj={variant}
                          productIndex={index}
                          variantIndex={variantIndex}
                          ifClose={productObj.variants.length > 1}
                        />
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              )}
          </div>
        )}
      </Draggable>
    );
  };

  return (
    <div className=" mt-5 overflow-y-auto">
      {showProductPicker && (
        <ProductPicker
          pickerIndex={pickerIndex}
          selectedProductsList={selectedProductsList}
          setSelectedProductsList={setSelectedProductsList}
          open={showProductPicker}
          onClose={() => setShowProductPicker(false)}
        />
      )}

      <div className="flex flex-col w-full">
        <div className="flex w-full gap-64 mb-2">
          <div className="text-l font-semibold ml-20">Product</div>
          <div className="text-l font-semibold">Discount</div>
        </div>
        <DragDropContext onDragEnd={handleDragDrop}>
          <div className="flex flex-col gap-1">
            <Droppable droppableId="Product" type="ProductGroup">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {selectedProductsList.map((product, index) => (
                    <div key={index} className="mb-4">
                      <ProductPlaceHolder
                        productObj={product}
                        index={index}
                        ifClose={selectedProductsList.length > 1}
                      />
                    </div>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        </DragDropContext>
      </div>
    </div>
  );
}

export default ProductList;
