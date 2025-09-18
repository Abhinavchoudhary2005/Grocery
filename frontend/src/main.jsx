import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Toaster } from "react-hot-toast";
import { BrowserRouter } from "react-router-dom";
import { ProductcontextProvider } from "./context/Productcontext.jsx";
import { CartContextProvider } from "./context/CartContex.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <CartContextProvider>
        <ProductcontextProvider>
          <App />
          <Toaster
            position="top-center"
            reverseOrder={false}
            toastOptions={{ duration: 2000 }}
          />
        </ProductcontextProvider>
      </CartContextProvider>
    </BrowserRouter>
  </StrictMode>
);
