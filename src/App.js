import { useState } from "react";
import "./App.css";
import ProductButton from "./Components/ProductButton";
import ProductList from "./Components/ProductList";

function App() {
  const [selectedProductsList, setSelectedProductsList] = useState([null]);

  return (
    <div className="App flex flex-col h-screen items-center">
      <div className="w-full md:w-6/12 mt-36">
        <h3 className="font-bold text-2xl">Add Products</h3>
        <ProductList
          selectedProductsList={selectedProductsList}
          setSelectedProductsList={setSelectedProductsList}
        />
        <ProductButton
          selectedProductsList={selectedProductsList}
          setSelectedProductsList={setSelectedProductsList}
        />
      </div>
    </div>
  );
}

export default App;
