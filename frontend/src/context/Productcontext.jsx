import React, { createContext, useState, useEffect } from "react";

export const Productcontext = createContext();

export const ProductcontextProvider = (props) => {
  const [allProduct, setAllProduct] = useState([]);

  const fetchProducts = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_KEY}/api/product`,
        {
          method: "GET",
        }
      );
      const data = await response.json();
      setAllProduct(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const deleteProduct = async (productId, token) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_KEY}/admin/remove/product/${productId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `${token}`,
          },
        }
      );
      const data = await response.json();
      if (data) {
        setAllProduct((prevProducts) =>
          prevProducts.filter((product) => product._id !== productId)
        );
        fetchProducts();
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      return false;
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <Productcontext.Provider
      value={{
        allProduct,
        fetchProducts,
        deleteProduct,
      }}
    >
      {props.children}
    </Productcontext.Provider>
  );
};
