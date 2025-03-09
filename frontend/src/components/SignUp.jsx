import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Eye, EyeOff, Loader, Check } from "lucide-react";

const OTPInput = ({ otp, setOtp, field }) => {
  const handleChange = (e, index) => {
    let value = e.target.value;
    if (!/^[0-9]?$/.test(value)) return;

    let newOtp = otp.split("");
    newOtp[index] = value;
    setOtp(newOtp.join(""));

    if (value && index < 5)
      document.getElementById(`${field}-otp-${index + 1}`).focus();
  };

  return (
    <div className="flex gap-2 w-full mr-2">
      {Array(6)
        .fill("")
        .map((_, i) => (
          <input
            key={i}
            id={`${field}-otp-${i}`}
            type="text"
            maxLength="1"
            className="input input-bordered w-10 text-center p-0"
            placeholder="-"
            value={otp[i] || ""}
            onChange={(e) => handleChange(e, i)}
          />
        ))}
    </div>
  );
};

const SignUp = ({ handleSwitchMode }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [aadhar, setAadhar] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("USER");
  const [otp, setOtp] = useState({ email: "", phone: "", aadhar: "" });
  const [otpSent, setOtpSent] = useState({
    email: false,
    phone: false,
    aadhar: false,
  });
  const [otpLoading, setOtpLoading] = useState({
    email: false,
    phone: false,
    aadhar: false,
  });
  const [verified, setVerified] = useState({
    email: false,
    phone: false,
    aadhar: true,
  });

  const [loading, setLoading] = useState(false);

  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
  };

  const validateAadhar = (aadhar) => {
    const aadharRegex = /^\d{12}$/;
    return aadharRegex.test(aadhar);
  };

  // if (field === "aadhar" && !validateAadhar(value)) {
  //   return toast.error("Invalid Aadhar number");
  // }

  const emailSendOtp = async (value) => {
    setOtpLoading((prev) => ({ ...prev, email: true }));

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_KEY}/otp/email-send-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: value }),
        }
      );
      const result = await res.json();

      if (res.ok) {
        toast.success(`OTP sent to email`);
        setOtpSent((prev) => ({ ...prev, email: true }));
      } else {
        toast.error(result.error || "Error sending OTP");
      }
    } catch (err) {
      toast.error("Network error: " + err.message);
    } finally {
      setOtpLoading((prev) => ({ ...prev, email: false }));
    }
  };

  const phoneSendOtp = async (value) => {
    if (!validatePhoneNumber(value)) {
      return toast.error("Invalid Indian phone number");
    }
    setOtpLoading((prev) => ({ ...prev, phone: true }));
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_KEY}/otp/phone-send-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: `+91${value}` }),
        }
      );
      const data = await response.json();
      if (data) {
        setOtpSent((prev) => ({ ...prev, phone: true }));
        toast.success("OTP sent successfully");
      } else {
        toast.error("Failed to send OTP");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error sending OTP");
    } finally {
      setOtpLoading((prev) => ({ ...prev, phone: false }));
    }
  };

  const aadharSendOtp = async () => {};

  const emailVerifyOtp = async () => {
    setOtpLoading((prev) => ({ ...prev, email: true }));
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_KEY}/otp/email-verify-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            otp: otp.email,
          }),
        }
      );

      const result = await res.json();
      if (res.ok) {
        setVerified((prev) => ({ ...prev, email: true }));
        setOtpSent((prev) => ({ ...prev, email: false }));
        toast.success(`email verified`);
      } else {
        toast.error(result.error || "Verification failed");
      }
    } catch (err) {
      toast.error("Network error: " + err.message);
    } finally {
      setOtpLoading((prev) => ({ ...prev, email: false }));
    }
  };

  const phoneVerifyOtp = async () => {
    setOtpLoading((prev) => ({ ...prev, phone: true }));
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_KEY}/otp/phone-verify-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: `+91${phone}`, otp: otp.phone }),
        }
      );
      const data = await response.json();
      if (data) {
        toast.success("OTP verified");
        setOtpSent((prev) => ({ ...prev, phone: false }));
        setVerified((prev) => ({ ...prev, phone: true }));
      } else {
        toast.error("Invalid OTP");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error verifying OTP");
    } finally {
      setOtpLoading((prev) => ({ ...prev, phone: false }));
    }
  };

  const aadharVerifyOtp = async () => {};

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !verified.email ||
      (role === "SELLER" && (!verified.phone || !verified.aadhar))
    ) {
      toast.error("Please verify all required fields before continuing.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_KEY}/user/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone: `+91${phone}`,
          password,
          role,
        }),
      });
      const result = await res.json();
      if (res.ok) {
        localStorage.setItem("token", result.uid);
        toast.success("Account created successfully");
        setTimeout(() => {
          if (result.redirectUrl) {
            window.location.href = result.redirectUrl;
          }
        }, 1000);
      } else {
        toast.error(result.error || "Signup failed");
      }
    } catch (err) {
      toast.error("Network error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className="max-w-md mx-auto p-6 border rounded-lg shadow-lg m-10"
      onSubmit={handleSubmit}
    >
      <h1 className="text-2xl font-semibold mb-4">Sign Up</h1>

      <div className="form-control mb-4">
        <label className="label">Full Name</label>
        <input
          type="text"
          id="name"
          className="input input-bordered"
          placeholder="Enter your full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      {["email", ...(role === "SELLER" ? ["phone"] : [])].map((field) => (
        <div key={field} className="form-control mb-4">
          <label className="label">
            {field.charAt(0).toUpperCase() + field.slice(1)}
          </label>
          <div className="flex gap-2">
            <input
              type={field === "email" ? "email" : "text"}
              id={field}
              className="input input-bordered w-full"
              placeholder={`Enter your ${field}`}
              value={
                field === "email" ? email : field === "phone" ? phone : aadhar
              }
              onChange={(e) =>
                field === "email"
                  ? setEmail(e.target.value)
                  : field === "phone"
                  ? setPhone(e.target.value)
                  : setAadhar(e.target.value)
              }
              required
              disabled={otpSent[field] || verified[field]}
            />
            <button
              type="button"
              className={verified[field] ? "" : "btn btn-primary"}
              onClick={() =>
                field === "email"
                  ? emailSendOtp(email)
                  : field === "phone"
                  ? phoneSendOtp(phone)
                  : aadharSendOtp(aadhar)
              }
              disabled={verified[field]}
            >
              {verified[field] ? (
                <Check
                  size={16}
                  className="bg-green-600 text-black  h-11 w-11 p-3 rounded-lg"
                />
              ) : otpLoading[field] ? (
                <Loader className="animate-spin" size={16} />
              ) : (
                "Send OTP"
              )}
            </button>
          </div>

          {otpSent[field] && !verified[field] && (
            <div className="flex gap-2 pt-2">
              <OTPInput
                otp={otp[field]}
                setOtp={(value) =>
                  setOtp((prev) => ({ ...prev, [field]: value }))
                }
                field={field}
              />
              <button
                type="button"
                className="btn btn-primary"
                onClick={() =>
                  field === "email"
                    ? emailVerifyOtp()
                    : field === "phone"
                    ? phoneVerifyOtp()
                    : aadharVerifyOtp()
                }
              >
                Verify OTP
              </button>
            </div>
          )}
        </div>
      ))}

      <div className="form-control mb-4">
        <label className="label">Password</label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            className="input input-bordered w-full pr-12"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            className="absolute right-3 top-3"
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>

      <div className="form-control mb-4">
        <label className="label">Role</label>
        <div className="flex items-center gap-2">
          <input
            type="radio"
            id="user"
            name="role"
            value="USER"
            checked={role === "USER"}
            onChange={(e) => setRole(e.target.value)}
            className="radio"
          />
          <label htmlFor="user" className="label cursor-pointer">
            Buyer
          </label>
          <input
            type="radio"
            id="seller"
            name="role"
            value="SELLER"
            checked={role === "SELLER"}
            onChange={(e) => setRole(e.target.value)}
            className="radio"
          />
          <label htmlFor="seller" className="label cursor-pointer">
            Seller
          </label>
        </div>
      </div>

      <button
        className="btn btn-primary w-full"
        type="submit"
        disabled={loading}
      >
        {loading ? <Loader className="animate-spin mx-auto" /> : "Continue"}
      </button>
      <p className="text-center pt-3">
        Already have an account?{" "}
        <button
          type="button"
          className="text-green-700"
          onClick={handleSwitchMode}
        >
          Login here
        </button>
      </p>
    </form>
  );
};

export default SignUp;
