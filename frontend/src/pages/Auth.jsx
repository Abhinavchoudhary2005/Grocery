import React, { useCallback, useState } from "react";
import toast from "react-hot-toast";
import { Eye, EyeOff, Loader } from "lucide-react";

const Login = ({
  email,
  setEmail,
  password,
  setPassword,
  handleSubmit,
  handleSwitchMode,
  showPassword,
  setShowPassword,
}) => (
  <form
    className="max-w-md mx-auto p-6 border rounded-lg shadow-lg"
    onSubmit={handleSubmit}
  >
    <h1 className="text-2xl font-semibold mb-4">Login</h1>

    <div className="form-control mb-4">
      <label htmlFor="email" className="label">
        Email Address
      </label>
      <input
        type="email"
        id="email"
        placeholder="Email Address"
        className="input input-bordered w-full"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
    </div>

    <div className="form-control mb-4">
      <label htmlFor="password" className="label">
        Password
      </label>
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          className="input input-bordered w-full pr-12"
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

    <button className="btn btn-primary w-full mb-4" type="submit">
      Continue
    </button>

    <p className="text-center">
      Create an account?{" "}
      <button
        type="button"
        className="text-green-700"
        onClick={handleSwitchMode}
      >
        Create here
      </button>
    </p>
  </form>
);

const OTPInput = ({ otp, setOtp }) => {
  const handleChange = (e, index) => {
    let value = e.target.value;
    if (!/^\d*$/.test(value)) return; // Only allow numbers

    let newOtp = otp.split("");
    newOtp[index] = value;
    setOtp(newOtp.join(""));

    // Move to the next box if input is filled
    if (value && index < 5) document.getElementById(`otp-${index + 1}`).focus();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      let newOtp = otp.split("");
      newOtp[index - 1] = "";
      setOtp(newOtp.join(""));
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };

  return (
    <div className="flex justify-center gap-2 mb-4">
      {Array(6)
        .fill("")
        .map((_, i) => (
          <input
            key={i}
            id={`otp-${i}`}
            type="text"
            maxLength="1"
            className="input input-bordered w-12 text-center p-1"
            value={otp[i] || ""}
            onChange={(e) => handleChange(e, i)}
            onKeyDown={(e) => handleKeyDown(e, i)}
          />
        ))}
    </div>
  );
};

const SignUp = ({
  email,
  setEmail,
  password,
  setPassword,
  handleSubmit,
  handleSwitchMode,
  showPassword,
  setShowPassword,
  role,
  setRole,
  otp,
  otpSent,
  setOtp,
  loading,
}) => (
  <form
    className="max-w-md mx-auto p-6 border rounded-lg shadow-lg"
    onSubmit={handleSubmit}
  >
    <h1 className="text-2xl font-semibold mb-4">Sign Up</h1>

    {!otpSent ? (
      <>
        <div className="form-control mb-4">
          <label htmlFor="email" className="label">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            placeholder="Email Address"
            className="input input-bordered w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-control mb-4">
          <label htmlFor="password" className="label">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="input input-bordered w-full pr-12"
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
      </>
    ) : (
      <OTPInput otp={otp} setOtp={setOtp} />
    )}

    <button
      className="btn btn-primary w-full mb-4"
      type="submit"
      disabled={loading}
    >
      {loading ? (
        <Loader className="animate-spin mx-auto" />
      ) : otpSent ? (
        "Verify OTP"
      ) : (
        "Continue"
      )}
    </button>

    <p className="text-center">
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

const Auth = () => {
  const [loginsignup, setLoginsignup] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("USER");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSwitchMode = useCallback(() => {
    setLoginsignup((prevMode) => (prevMode === "login" ? "signup" : "login"));
    setPassword("");
    setOtpSent(false);
    setShowPassword(false);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (loginsignup === "signup" && !otpSent) {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_KEY}/user/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, role }),
        });

        const result = await res.json();
        if (res.ok) {
          toast.success("OTP sent to your email.");
          setOtpSent(true);
          setOtp(""); // Clear form and show OTP inputs
        } else {
          toast.error(result.error || "Error sending OTP");
        }
      } catch (err) {
        toast.error("Network error: " + err.message);
      } finally {
        setLoading(false);
      }
      return;
    }

    if (loginsignup === "signup" && otpSent) {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_KEY}/user/verify-otp`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, otp, role }),
          }
        );

        const result = await res.json();
        if (res.ok) {
          localStorage.setItem("token", result.uid);
          toast.success("Account verified! Logging in...");
          setTimeout(() => {
            if (result.redirectUrl) {
              window.location.href = result.redirectUrl;
            }
          }, 1500);
        } else {
          toast.error(result.error || "OTP verification failed");
        }
      } catch (err) {
        toast.error("Network error: " + err.message);
      } finally {
        setLoading(false);
      }
      return;
    }

    if (loginsignup === "login") {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_KEY}/user/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const result = await res.json();
        if (res.ok) {
          localStorage.setItem("token", result.uid);
          toast.success("Logged in successfully");
          setTimeout(() => {
            if (result.redirectUrl) {
              window.location.href = result.redirectUrl;
            }
          }, 1500);
        } else {
          toast.error(result.error || "Something went wrong");
        }
      } catch (err) {
        toast.error("Network error: " + err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <div className="w-full max-w-md">
        {loginsignup === "login" ? (
          <Login
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            handleSubmit={handleSubmit}
            handleSwitchMode={handleSwitchMode}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
          />
        ) : (
          <SignUp
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            handleSubmit={handleSubmit}
            handleSwitchMode={handleSwitchMode}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            role={role}
            setRole={setRole}
            otp={otp}
            setOtp={setOtp}
            otpSent={otpSent}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
};

export default Auth;
