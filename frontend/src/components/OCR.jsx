import { useState, useContext, useRef } from "react";
import { FiCamera } from "react-icons/fi";
import toast from "react-hot-toast";
import { CartContext } from "../context/CartContex.jsx";
import { Productcontext } from "../context/Productcontext";

const OCR = () => {
  const { fetchCart } = useContext(CartContext);
  const { allProduct } = useContext(Productcontext);
  const [loading, setLoading] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const token = localStorage.getItem("token");

  const toggleOptions = () => setShowOptions(!showOptions);

  const handleImageUpload = async (event) => {
    const fileInput = event.target;
    const file = fileInput.files[0];
    if (!file) return;
    await processImage(await fileToBase64(file));
    fileInput.value = "";
  };

  const startScanner = async () => {
    try {
      setShowScanner(true); // Ensure video is rendered
      await new Promise((resolve) => setTimeout(resolve, 100)); // Small delay

      if (!videoRef.current) {
        console.error("Video element not found!");
        toast.error("Failed to access camera.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });

      videoRef.current.srcObject = stream;
    } catch (error) {
      console.error("Camera Error:", error);
      toast.error("Camera access denied.");
    }
  };

  const captureImage = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const context = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = canvas.toDataURL("image/png").split(",")[1];
    processImage(imageData);

    stopScanner();
  };

  const stopScanner = () => {
    const stream = videoRef.current?.srcObject;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setShowScanner(false);
  };

  const processImage = async (base64Image) => {
    setLoading(true);
    setShowOptions(false);

    try {
      const ocrResponse = await fetch(
        `${import.meta.env.VITE_API_KEY}/detectText`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ base64Image }),
        }
      );

      const ocrData = await ocrResponse.json();
      let detectedText = ocrData.responses?.[0]?.fullTextAnnotation?.text || "";

      if (!detectedText) {
        toast.error("My Free Trial has expired. Please try again later.");
        setLoading(false);
        return;
      }

      console.log("Detected Text:", detectedText);

      const response = await fetch(
        `${import.meta.env.VITE_API_KEY}/vertex-ai`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            detectedText,
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
        setLoading(false);
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
        setLoading(false);
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
        setLoading(false);
        return;
      }

      if (!token) {
        toast.error("Please login to create a Cart");
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
      toast.error("Error processing the image.");
    } finally {
      setLoading(false);
    }
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = (error) => reject(error);
    });
  };

  return (
    <>
      {loading && (
        <div className="fixed inset-0 bg-opacity-50 bg-gray-700 flex items-center justify-center">
          <div className="animate-spin h-12 w-12 border-4 border-white border-t-transparent rounded-full"></div>
        </div>
      )}

      <div className="relative">
        <button
          onClick={toggleOptions}
          className="p-2 rounded-full bg-gray-200 hover:bg-gray-300"
        >
          <FiCamera className="text-gray-800 w-6 h-6" />
        </button>

        {showOptions && (
          <div className="absolute mt-2 bg-white shadow-lg rounded-lg w-32">
            <button
              className="block w-full px-4 py-2 text-left hover:bg-gray-200"
              onClick={() => document.getElementById("image-upload").click()}
            >
              Upload
            </button>
            <button
              className="block w-full px-4 py-2 text-left hover:bg-gray-200"
              onClick={startScanner}
            >
              Scan
            </button>
          </div>
        )}

        <input
          id="image-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
          disabled={loading}
        />
      </div>

      <div
        className={`fixed inset-0 flex flex-col items-center justify-center bg-black bg-opacity-80 z-50 ${
          showScanner ? "block" : "hidden"
        }`}
      >
        <video ref={videoRef} autoPlay className="w-full max-w-md rounded-lg" />
        <button
          className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg"
          onClick={captureImage}
        >
          Capture
        </button>
        <button
          className="mt-2 px-4 py-2 bg-red-500 text-white rounded-lg"
          onClick={stopScanner}
        >
          Cancel
        </button>
        <canvas ref={canvasRef} className="hidden"></canvas>
      </div>
    </>
  );
};

export default OCR;
