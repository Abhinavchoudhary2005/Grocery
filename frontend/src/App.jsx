import { Route, Routes, useParams } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import { useThemeStore } from "./store/useThemeStore";
import Footer from "./components/Footer";
import Auth from "./pages/Auth";
import Cart from "./pages/Cart";
import Category from "./pages/Category";
import Checkout from "./pages/Checkout";
import MyOrders from "./pages/MyOrders";
import AboutUs from "./pages/Aboutus";
import ContactUs from "./pages/ContactUs";
import Sell from "./pages/Sell";
import ListedProductsPage from "./pages/ListedProductsPage";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import ReceivedOrdersPage from "./pages/ReceivedOrdersPage";
import Chatbot from "./components/Chatbot";

export default function App() {
  const { theme } = useThemeStore();

  const CategoryWrapper = () => {
    const { category } = useParams();
    return <Category category={category} />;
  };

  return (
    <div data-theme={theme}>
      <Navbar />
      <Chatbot />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/category/:category" element={<CategoryWrapper />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/orders" element={<MyOrders />} />
        <Route path="/aboutus" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/sell" element={<Sell />} />
        <Route path="/listed-products" element={<ListedProductsPage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/recivedOrders" element={<ReceivedOrdersPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </div>
  );
}
