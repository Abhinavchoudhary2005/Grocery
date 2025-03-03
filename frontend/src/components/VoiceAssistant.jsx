import React, { useState, useContext } from "react";
import { FiMic } from "react-icons/fi";
import toast from "react-hot-toast";
import { CartContext } from "../context/CartContex.jsx";
import { Productcontext } from "../context/Productcontext";

const VoiceAssistant = () => {
  const { fetchCart } = useContext(CartContext);
  const { allProduct } = useContext(Productcontext);
  const token = localStorage.getItem("token");

  const [listening, setListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState("");
  const [recognition, setRecognition] = useState(null);

  const startListening = async () => {
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      toast.error("Speech Recognition not supported in this browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop()); // Release the microphone

      const speech = new (window.SpeechRecognition ||
        window.webkitSpeechRecognition)();
      speech.lang = "en-US";
      speech.continuous = true; // ✅ Keep listening until stopped
      speech.interimResults = true;

      speech.onstart = () => {
        setListening(true);
        setRecognizedText("");
        console.log("Listening started...");
      };

      speech.onresult = (event) => {
        const text = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join("");
        setRecognizedText(text);
      };

      speech.onerror = (event) => {
        console.error("Speech Recognition Error:", event.error);
        toast.error(`Error: ${event.error}`);
        setListening(false);
      };

      setRecognition(speech);
      speech.start();
    } catch (error) {
      toast.error("Microphone access is required to use voice commands.");
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
    }
    setListening(false);
    if (recognizedText.trim()) processVoiceCommand(recognizedText);
  };

  const processVoiceCommand = async (spokenText) => {
    toast("Processing voice input...");
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_KEY}/vertex-ai`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            detectedText: spokenText,
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
      console.error("Error:", error);
      toast.error("Error processing the voice input.");
    }
  };

  return (
    <>
      <div className="relative">
        <button
          onClick={startListening}
          className="p-2 rounded-full bg-gray-200 hover:bg-gray-300"
        >
          <FiMic className="text-gray-800 w-6 h-6" />
        </button>
      </div>

      {listening && (
        <div className="fixed inset-0 bg-opacity-50 bg-gray-700 flex flex-col items-center justify-center">
          <div className="animate-spin h-12 w-12 border-4 border-white border-t-transparent rounded-full"></div>
          <p className="text-white mt-4 text-lg">
            {recognizedText || "Listening..."}
          </p>
          <button
            onClick={stopListening}
            className="absolute bottom-10 px-4 py-2 bg-red-500 text-white rounded-lg"
          >
            Stop Listening
          </button>
        </div>
      )}
    </>
  );
};

export default VoiceAssistant;
