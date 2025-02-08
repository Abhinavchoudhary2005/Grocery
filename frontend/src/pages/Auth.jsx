import React, { useCallback, useState } from "react";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

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

const SignUp = ({
  name,
  setName,
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
}) => (
  <form
    className="max-w-md mx-auto p-6 border rounded-lg shadow-lg"
    onSubmit={handleSubmit}
  >
    <h1 className="text-2xl font-semibold mb-4">Sign Up</h1>

    <div className="form-control mb-4">
      <label htmlFor="name" className="label">
        Your Name
      </label>
      <input
        type="text"
        id="name"
        placeholder="Your Name"
        className="input input-bordered w-full"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
    </div>

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

    <button className="btn btn-primary w-full mb-4" type="submit">
      Continue
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
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("USER"); // Default to 'USER'

  const handleSwitchMode = useCallback(() => {
    setLoginsignup((prevMode) => (prevMode === "login" ? "signup" : "login"));
    setPassword("");
    setName("");
    setShowPassword(false);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const url =
      loginsignup === "login"
        ? `${import.meta.env.VITE_API_KEY}/user/login`
        : `${import.meta.env.VITE_API_KEY}/user/signup`;

    const data =
      loginsignup === "login"
        ? { email, password }
        : { name, email, password, role }; // Send the role data during signup

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (res.ok) {
        localStorage.setItem("token", result.uid);

        toast.success(
          loginsignup === "signup"
            ? "User created successfully"
            : "Logged in successfully"
        );

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
            name={name}
            setName={setName}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            handleSubmit={handleSubmit}
            handleSwitchMode={handleSwitchMode}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            role={role}
            setRole={setRole} // Pass role state to SignUp component
          />
        )}
      </div>
    </div>
  );
};

export default Auth;
