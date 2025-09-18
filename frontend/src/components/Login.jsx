import { useState } from "react";
import { Eye, EyeOff, Loader } from "lucide-react";
import { toast } from "react-hot-toast";

const Login = ({ handleSwitchMode }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

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
        }, 1000);
      } else {
        toast.error(result.error || "Something went wrong");
      }
    } catch (err) {
      toast.error("Network error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
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

      <button
        className="btn btn-primary w-full mb-4 flex justify-center items-center"
        type="submit"
        disabled={loading}
      >
        {loading ? <Loader className="animate-spin mx-auto" /> : "Continue"}
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
};

export default Login;
