import { useState, useRef, useEffect, useContext } from "react";
import { marked } from "marked";
import { motion } from "framer-motion";
import { XCircleIcon, MessageCircleIcon } from "lucide-react";
import toast from "react-hot-toast";
import { Productcontext } from "../context/Productcontext";
import { CartContext } from "../context/CartContex.jsx";

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [currentStep, setCurrentStep] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [lastBotMessage, setLastBotMessage] = useState("");
  const [pendingCartAction, setPendingCartAction] = useState(false);
  const token = localStorage.getItem("token");

  const { allProduct } = useContext(Productcontext);
  const { fetchCart, cart } = useContext(CartContext);

  const chatContainerRef = useRef(null);

  useEffect(() => {
    // Auto scroll to bottom on new message
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  useEffect(() => {
    const fetchCartData = async () => {
      try {
        await fetchCart();
      } catch (error) {
        console.error("Failed to fetch cart:", error);
        toast.error("Error fetching cart!");
      }
    };
    fetchCartData();
  }, [fetchCart]);

  const handleSendMessage = async (userInput = null) => {
    if (!userInput) {
      userInput = input.trim();
      if (userInput === "") return;
      addMessage(userInput, "user");
      setInput("");
    }

    if (pendingCartAction) {
      if (userInput.toLowerCase() === "yes") {
        if (!token) {
          toast.error("Please login to create cart!");
          return;
        }
        handleAddToCart(lastBotMessage);
        return;
      }

      if (userInput.toLowerCase() === "no") {
        return;
      }
    }

    if (currentStep === "budget") {
      fetchResponse(`Make a grocery list under ₹${userInput} for a week`);
      setCurrentStep(null);
    } else if (currentStep === "ingredient_list") {
      fetchResponse(`Give the ingredient list for ${userInput}`);
      setCurrentStep(null);
    } else {
      if (userInput === "Analyze my Cart") {
        if (!cart) {
          await fetchCart();
        }
        const simplyfycart = async () => {
          const simplifiedCart = cart.map(
            ({ name, new_price, weight, quantity }) => ({
              name,
              price: new_price,
              weight,
              quantity,
            })
          );
          return simplifiedCart;
        };
        const simplifiedCartResponse = await simplyfycart();
        fetchResponse(
          `Analyze my Cart, cart:${JSON.stringify(simplifiedCartResponse)}`
        );
        setCurrentStep(null);
      } else {
        fetchResponse(userInput);
      }
    }
  };

  const fetchResponse = async (message) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_KEY}/chatbot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          previousBotMessage: lastBotMessage,
          allProductNames: allProduct.map((p) => ({
            name: p.name,
            quantity: p.quantity,
            price: p.new_price,
          })),
        }),
      });
      const data = await response.json();

      addMessage(marked.parse(data.reply), "bot");

      // ✅ Update last bot message
      setLastBotMessage(data.reply);

      // ✅ Check if response includes a list and prompt for adding to cart
      if (
        data.reply.includes("Do you want to add these items to your cart?") ||
        data.reply.includes("-")
      ) {
        setPendingCartAction(true);
      }
    } catch (error) {
      addMessage("⚠️ Error: Could not reach the server.", "bot");
    }
  };

  const handleAddToCart = async (botMessage) => {
    const extractedItems = botMessage;
    if (!extractedItems.length) {
      toast.error("No valid items found to add to the cart.");
      setPendingCartAction(false);
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_KEY}/vertex-ai`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            detectedText: botMessage,
            allProductNames: allProduct.map((p) => ({
              name: p.name,
              quantity: p.quantity,
            })),
          }),
        }
      );

      const data = await response.json();
      if (!data) {
        toast.error("Failed to extract product details.");
        setPendingCartAction(false);
        return;
      }

      const formattedItems = [];
      const notSoldItems = [];

      data.forEach(([quantity, name, unit]) => {
        const match = allProduct.find((p) =>
          name.toLowerCase().includes(p.name.toLowerCase())
        );
        if (match) {
          formattedItems.push([quantity, match.name, unit || match.quantity]);
        } else {
          notSoldItems.push(name);
        }
      });

      if (formattedItems.length === 0) {
        toast.error("No matching products found.");
        setPendingCartAction(false);
        return;
      }

      const notSoldItemsText =
        notSoldItems.length > 0
          ? `\n\nNot Available:\n${notSoldItems.join(", ")}`
          : "";

      const userConfirmed = window.confirm(
        `Items to add:\n${formattedItems
          .map(([q, n, u]) => `${q} X ${u} of ${n}`)
          .join("\n")}${notSoldItemsText}\n\nConfirm?`
      );

      if (!userConfirmed) {
        toast("Cancelled.");
        setPendingCartAction(false);
        return;
      }

      if (!token) {
        toast.error("Please login to create a Cart");
        setPendingCartAction(false);
        return;
      }

      const backendResponse = await fetch(
        `${import.meta.env.VITE_API_KEY}/ocr`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`,
          },
          body: JSON.stringify({ detectedItems: formattedItems }),
        }
      );

      if (backendResponse.ok) {
        toast.success("Items added to cart!");
        fetchCart();
      } else {
        toast.error("Failed to add items.");
      }
    } catch (error) {
      toast.error("Failed to add items.");
    }

    setPendingCartAction(false);
  };

  const addMessage = (text, type) => {
    setMessages((prev) => [...prev, { text, type }]);
  };

  const sendQuickMessage = (action) => {
    addMessage(action, "user");

    if (action === "Budget List") {
      addMessage("Enter your budget (₹):", "bot");
      setCurrentStep("budget");
    } else if (action === "Get Ingredient List") {
      addMessage("Enter the recipe name:", "bot");
      setCurrentStep("ingredient_list");
    } else if (action === "Analyze Cart") {
      if (!token) {
        toast.error("Please login to create cart!");
        return;
      }
      setCurrentStep("Analyze Cart");
      handleSendMessage("Analyze my Cart");
    } else {
      fetchResponse(action);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSendMessage();
  };

  return (
    <>
      {/* Floating Button */}
      <button
        ref={chatContainerRef}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed right-4 top-40 transform -translate-y-1/2 bg-green-500 text-white p-3 rounded-full shadow-lg hover:bg-green-600 transition z-50"
      >
        {isOpen ? <XCircleIcon size={24} /> : <MessageCircleIcon size={24} />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 50 }}
          className="fixed right-6 top-1/4 w-80 bg-white border border-gray-300 rounded-lg shadow-xl z-40 flex flex-col"
          style={{ height: "28rem" }}
        >
          {/* Header */}
          <div className="bg-green-500 text-white text-center py-4 font-bold">
            Grocery Assistant
          </div>

          {/* Chat Box */}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-2"
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`chat ${
                  msg.type === "user" ? "chat-end" : "chat-start"
                }`}
              >
                {typeof msg.text === "string" ? (
                  <div
                    className={`chat-bubble ${
                      msg.type === "user"
                        ? "bg-green-300 text-black"
                        : "bg-gray-300 text-black"
                    }`}
                    dangerouslySetInnerHTML={{ __html: msg.text }}
                  />
                ) : (
                  msg.text
                )}
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 overflow-x-auto p-2 bg-gray-100">
            <button
              onClick={() => sendQuickMessage("Budget List")}
              className="btn btn-outline btn-sm"
            >
              Budget List
            </button>
            <button
              onClick={() => sendQuickMessage("Analyze Cart")}
              className="btn btn-outline btn-sm"
            >
              Analyze Cart
            </button>
            <button
              onClick={() => sendQuickMessage("Get Ingredient List")}
              className="btn btn-outline btn-sm"
            >
              Get Ingredient List
            </button>
          </div>

          {/* Input */}
          <div className="flex items-center border-t border-gray-200 p-2 bg-white">
            <input
              type="text"
              className="input input-bordered flex-1 max-w-[75%] text-sm p-2"
              placeholder="Ask about groceries..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button
              className="btn btn-success ml-2 px-4 py-2 text-sm"
              onClick={() => handleSendMessage()}
            >
              Send
            </button>
          </div>
        </motion.div>
      )}
    </>
  );
};

export default Chatbot;
