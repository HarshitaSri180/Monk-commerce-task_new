import React, { useState, useEffect, useMemo, useRef } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import CloseIcon from "@mui/icons-material/Close";
import Divider from "@mui/material/Divider";
import SearchIcon from "@mui/icons-material/Search";
import CircularProgress from "@mui/material/CircularProgress";
import axios from "axios";

// Debouncing function
const debounce = (func, delay) => {
  let debounceTimer;
  return (...args) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

// calculate Total Products count
const CalculateProducts = (items) => {
  let ProductCount = 0;

  Object.keys(items).forEach((id) => {
    const product = items[id];
    if (product.isChecked) ProductCount += 1;
  });

  return ProductCount;
};

// function to get selected products and variants
const getSelectedProducts = (checkBoxItems, productList) => {
  const selectedProducts = [];

  Object.keys(checkBoxItems).forEach((productId) => {
    const product = productList.find(
      (item) => String(item.id) === String(productId)
    );
    if (checkBoxItems[productId].isChecked) {
      const selectedVariants = [];

      Object.keys(checkBoxItems[productId]?.variants).forEach((variantId) => {
        if (checkBoxItems[productId]?.variants[variantId]) {
          const variant = product.variants.find(
            (v) => String(v.id) === String(variantId)
          );
          selectedVariants.push(variant);
        }
      });

      selectedProducts.push({
        ...product,
        variants: selectedVariants,
      });
    }
  });

  return selectedProducts;
};

const VariantCheckBox = ({
  variant,
  productId,
  variantId,
  handleVariantCheckBox,
  checkBoxItems,
}) => {
  return (
    <div>
      <div className="w-full pl-16">
        <div className="flex h-full w-full p-4 justify-between pl-3">
          <div className="flex gap-10">
            <input
              type="checkbox"
              onChange={(e) => handleVariantCheckBox(e, productId, variantId)}
              checked={checkBoxItems?.[productId]?.variants?.[variantId]}
              className="w-5 h-5 accent-green-700 cursor-pointer"
            />
            <DialogContentText>{variant.title}</DialogContentText>
          </div>
          <div className="flex gap-8 pr-8">
            {variant.inventory_quantity && (
              <DialogContentText>
                {-1 * variant.inventory_quantity} Available
              </DialogContentText>
            )}
            <DialogContentText>₹{variant.price}</DialogContentText>
          </div>
        </div>
      </div>
      <Divider />
    </div>
  );
};

const RenderProduct = ({
  product,
  checkBoxItems,
  handleProductCheckBox,
  handleVariantCheckBox,
}) => {
  return (
    <div key={product.id}>
      <div className="w-full">
        <div className="flex p-4 w-full h-full items-center gap-8">
          <input
            type="checkbox"
            checked={checkBoxItems?.[product.id]?.isChecked}
            onChange={(e) => handleProductCheckBox(e, product.id)}
            className="w-5 h-5 accent-green-700 cursor-pointer"
          />
          <img
            src={product.image.src}
            alt={product.title}
            className="h-9 w-9 rounded-md"
            loading="lazy"
          />
          <DialogContentText>{product.title}</DialogContentText>
        </div>
      </div>
      <Divider />
      {product.variants.length > 0 &&
        product.variants.map((variant) => {
          return (
            <VariantCheckBox
              key={variant.id}
              variant={variant}
              productId={product.id}
              variantId={variant.id}
              handleVariantCheckBox={handleVariantCheckBox}
              checkBoxItems={checkBoxItems}
            />
          );
        })}
    </div>
  );
};

export default function ProductPicker({
  open,
  onClose,
  pickerIndex,
  selectedProductsList,
  setSelectedProductsList,
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [productList, setProductList] = useState([]);
  const [filteredProductList, setFilteredProductList] = useState([]);
  const [checkBoxItems, setCheckBoxItems] = useState({});
  const [searchText, setSearchText] = useState("");
  const [productCount, setProductCount] = useState(0);
  const [page, setPage] = useState(1);
  const listRef = useRef(null);

  //* API call

  useEffect(() => {
    fetchData(page);
  }, [page]);

  const fetchData = async (page) => {
    try {
      const options = {
        headers: { "x-api-key": "72njgfa948d9aS7gs5" },
      };
      const response = await axios.get(
        `https://stageapi.monkcommerce.app/task/products/search?search=Hat&page=${page}&limit=10`,
        options
      );
      setProductList((prevList) => [...prevList, ...response.data]);
      setFilteredProductList((prevList) => [...prevList, ...response.data]);
      setIsLoading(false);
    } catch (err) {
      console.log("Error while fetching the Data", err);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (
        listRef.current &&
        listRef.current.scrollTop + listRef.current.clientHeight >=
          listRef.current.scrollHeight - 80
      ) {
        setPage((prevPage) => prevPage + 1);
      }
    };

    let currentListRef = listRef.current;
    if (!isLoading && currentListRef) {
      currentListRef.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (!isLoading && currentListRef) {
        currentListRef.removeEventListener("scroll", handleScroll);
      }
    };
  }, [isLoading]);

  //* API call

  const handleClose = () => {
    onClose();
  };

  const handleProductCheckBox = (e, productId) => {
    const isChecked = e.target.checked;
    const updatedItems = { ...checkBoxItems };
    const productItem = productList.find((item) => item.id === productId);

    if (productItem.variants) {
      const variantsChecked = productItem.variants.reduce((acc, variant) => {
        acc[variant.id] = isChecked;
        return acc;
      }, {});
      updatedItems[productId] = { isChecked, variants: variantsChecked };
    } else {
      updatedItems[productId] = { isChecked, variants: {} };
    }

    setCheckBoxItems(updatedItems);
  };

  const handleVariantCheckBox = (e, productId, variantId) => {
    const isChecked = e.target.checked;

    const updatedItems = { ...checkBoxItems };

    // To update the variant state
    updatedItems[productId] = {
      ...checkBoxItems[productId],
      variants: {
        ...checkBoxItems[productId]?.variants,
        [variantId]: isChecked,
      },
    };

    // To update the product state
    const allVariantsChecked = Object.values(
      updatedItems[productId].variants
    ).every((v) => v === false);
    updatedItems[productId].isChecked = !allVariantsChecked;

    setCheckBoxItems(updatedItems);
  };

  // Debounced search function
  const debouncedFilter = useMemo(
    () =>
      debounce((searchText) => {
        setFilteredProductList(
          productList.filter((product) =>
            product.title.toLowerCase().includes(searchText.toLowerCase())
          )
        );
      }, 300),
    [productList]
  );

  const AddProduct = () => {
    if (!checkBoxItems || Object.keys(checkBoxItems).length === 0) {
      return;
    }
    const allUnchecked = Object.values(checkBoxItems).every(
      (item) => !item.isChecked
    );
    if (allUnchecked) {
      return;
    }
    const selectedProducts = getSelectedProducts(checkBoxItems, productList);
    const updatedSelectedProductsList = [...selectedProductsList];
    updatedSelectedProductsList.splice(pickerIndex, 1);
    updatedSelectedProductsList.splice(pickerIndex, 0, ...selectedProducts);
    setSelectedProductsList([...updatedSelectedProductsList]);
    handleClose();
  };

  useEffect(() => {
    debouncedFilter(searchText);
  }, [searchText, debouncedFilter]);

  useEffect(() => {
    setProductCount(CalculateProducts(checkBoxItems));
  }, [checkBoxItems]);

  return (
    <div>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="md"
        fullWidth={true}
      >
        <div className="flex justify-between">
          <DialogTitle id="alert-dialog-title">Select Products</DialogTitle>
          <DialogActions>
            <Button onClick={handleClose}>
              <CloseIcon className="text-gray-600" />
            </Button>
          </DialogActions>
        </div>
        <Divider />
        <div className="p-3">
          <div className="flex w-full p-1 border-2 rounded-md border-gray-400">
            <SearchIcon
              className="flex min-h-10 text-gray-400 ml-3 mr-3"
              sx={{ fontSize: 26 }}
            />
            <input
              type="text"
              className="w-full min-h-10 outline-none"
              vaule={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
              }}
            />
          </div>
        </div>
        <Divider />
        <div
          id="Products List"
          className="overflow-y-scroll max-h-96"
          ref={listRef}
        >
          {isLoading ? (
            <div className="flex h-full w-full p-4 justify-center items-center">
              <CircularProgress />
            </div>
          ) : filteredProductList.length === 0 ? (
            <DialogContentText className="h-full w-full p-4 justify-between">
              No Records Available
            </DialogContentText>
          ) : (
            filteredProductList.map((product) => {
              return (
                <RenderProduct
                  key={product.id}
                  product={product}
                  checkBoxItems={checkBoxItems}
                  handleProductCheckBox={handleProductCheckBox}
                  handleVariantCheckBox={handleVariantCheckBox}
                />
              );
            })
          )}
        </div>
        <Divider />
        <div className="w-full min-h-12 flex">
          <div className="w-full flex justify-between items-center p-4">
            <div>{productCount} product Selected</div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  handleClose();
                }}
                className="cursor-pointer w-24 rounded-md border-2 hover:border-gray-400 border-green-700 px-3.5 py-2.5 text-m font-semibold text-green-700 shadow-sm hover:text-gray-700 hover:bg-gray-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  AddProduct();
                }}
                className="cursor-pointer w-20 rounded-md bg-green-700 px-3.5 py-2.5 text-m font-semibold text-white shadow-sm hover:bg-green-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
