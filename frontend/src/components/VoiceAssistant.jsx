import React, { useState, useContext } from "react";
import { FiMic } from "react-icons/fi";
import toast from "react-hot-toast";
import { CartContext } from "../context/CartContex";
import { Productcontext } from "../context/Productcontext";
import RecordRTC from "recordrtc";
import axios from "axios";

const VoiceAssistant = () => {
  const { fetchCart } = useContext(CartContext);
  const { allProduct } = useContext(Productcontext);
  const token = localStorage.getItem("token");

  const [listening, setListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState("");
  const [recorder, setRecorder] = useState(null);

  // Start recording
  const startListening = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const newRecorder = new RecordRTC(stream, {
      type: "audio",
      mimeType: "audio/wav",
      recorderType: RecordRTC.StereoAudioRecorder,
      numberOfAudioChannels: 1,
      desiredSampRate: 16000,
    });

    newRecorder.startRecording();
    setRecorder(newRecorder);
    setListening(true);
  };

  // Stop recording and send to backend
  const stopListening = async () => {
    if (!recorder) return;

    recorder.stopRecording(async () => {
      const audioBlob = recorder.getBlob();
      const formData = new FormData();
      formData.append("audio", audioBlob, "audio.wav");

      try {
        const response = await axios.post(
          "http://localhost:8000/transcribe",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        setRecognizedText(response.data.transcription);
        toast.success("Voice processed successfully!");
      } catch (error) {
        toast.error("Failed to transcribe audio.");
        console.error("Error:", error);
      }

      // Stop the media stream
      if (recorder.stream) {
        recorder.stream.getTracks().forEach((track) => track.stop()); // Stops mic
      }

      setListening(false);
    });

    console.log(recognizedText);
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
