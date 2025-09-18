import React, { useCallback, useState } from "react";
import Login from "../components/Login";
import SignUp from "../components/SignUp";

const Auth = () => {
  const [loginsignup, setLoginsignup] = useState("login");

  const handleSwitchMode = useCallback(() => {
    setLoginsignup((prevMode) => (prevMode === "login" ? "signup" : "login"));
  }, []);

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <div className="w-full max-w-md">
        {loginsignup === "login" ? (
          <Login handleSwitchMode={handleSwitchMode} />
        ) : (
          <SignUp handleSwitchMode={handleSwitchMode} />
        )}
      </div>
    </div>
  );
};

export default Auth;
