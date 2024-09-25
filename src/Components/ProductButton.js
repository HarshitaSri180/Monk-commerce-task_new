import React from "react";

function ProductButtons({ selectedProductsList, setSelectedProductsList }) {
  return (
    <div className="flex m-4 w-7/12  justify-end">
      <button
        onClick={() => setSelectedProductsList([...selectedProductsList, null])}
        className="cursor-pointer  w-6/12  bg-transparent border-2 border-green-700 px-3.5 py-2.5 text-m font-semibold text-green-700 shadow-sm hover:text-white hover:bg-green-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        Add Product
      </button>
    </div>
  );
}

export default ProductButtons;
