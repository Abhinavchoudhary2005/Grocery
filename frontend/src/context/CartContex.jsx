import React, { createContext, useState, useEffect, useCallback } from "react";

export const CartContext = createContext();

export const CartContextProvider = (props) => {
  const token = localStorage.getItem("token");
  const [cart, setCart] = useState([]);
  const [totalCartValue, setTotalCartValue] = useState(0);
  const [cartChanged, setCartChanged] = useState(false);

  const fetchCart = useCallback(async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_KEY}/cart`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error fetching cart");
      }
      const responseData = await res.json();
      setCart(responseData.cart);
      setTotalCartValue(responseData.totalCartValue);
    } catch (error) {
      console.error("Error fetching cart:", error);
      setCart([]);
    }
  }, [token]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart, cartChanged]);

  const triggerCartChange = () => {
    setCartChanged((prev) => !prev);
  };

  return (
    <CartContext.Provider
      value={{ cart, totalCartValue, fetchCart, triggerCartChange }}
    >
      {props.children}
    </CartContext.Provider>
  );
};
