import { useState } from "react";
import api from '../lib/api'
import { toast } from 'react-hot-toast'
import { User, Lock, Mail } from "lucide-react";

export default function AuthModal({ type, onOpenModal, onClose, setIsAuthenticated }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (!type) return null; // Don't render modal if type is null

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation for signup password match
    if (type === "signup" && password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    setLoading(true);

    try {
      const endpoint =
        type === "signup"
          ? "/api/auth/register"
          : "/api/auth/login";

      // ✅ For login → use email & password only
      // ✅ For signup → use username, email & password
      const payload =
        type === "signup"
          ? { username, email, password, confirmPassword }
          : { email, password };

  const { data } = await api.post(endpoint, payload);

      toast.success(data.message || "Success!");

      // Clear form fields
      setUsername("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");

      if (type === "signup") {
        onOpenModal("login"); // Switch to login modal after signup
      } else {
        setIsAuthenticated(true);
        onClose(); // Close modal after successful login
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="relative w-full max-w-md p-4 sm:p-6 bg-gradient-to-tr from-indigo-900 via-purple-900 to-indigo-800 text-white rounded-2xl shadow-2xl mx-auto" onClick={(e) => e.stopPropagation()}>
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-white"
          onClick={onClose}
        >
          ✕
        </button>

        <h3 className="text-3xl font-bold text-center">
          {type === "login" ? "Welcome Back" : "Create Account"}
        </h3>
        <p className="text-center text-gray-300 text-sm mb-6">
          {type === "login"
            ? "Log in to access your account"
            : "Sign up to start generating captions"}
        </p>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {/* Username (Signup only) */}
          {type === "signup" && (
            <div className="relative">
              <User className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/10 placeholder-gray-300 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                required
              />
            </div>
          )}

          {/* Email (Both login & signup) */}
          <div className="relative">
            <Mail className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/10 placeholder-gray-300 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              required
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/10 placeholder-gray-300 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              required
            />
          </div>

          {/* Confirm Password (Signup only) */}
          {type === "signup" && (
            <div className="relative">
              <Lock className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/10 placeholder-gray-300 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                required
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 mt-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Processing..." : type === "login" ? "Log In" : "Sign Up"}
          </button>
        </form>

        <p className="text-center text-sm mt-4 text-gray-300">
          {type === "login" ? (
            <>
              Don’t have an account?{" "}
              <button
                className="text-blue-400 hover:underline"
                onClick={() => onOpenModal("signup")}
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                className="text-blue-400 hover:underline"
                onClick={() => onOpenModal("login")}
              >
                Log in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
