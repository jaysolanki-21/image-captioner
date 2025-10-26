import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from '../lib/api'
import { Menu, X } from "lucide-react";

const Header = ({ onOpenModal, isAuthenticated, setIsAuthenticated }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true); // 🔹 Loading state to avoid flicker

  // ✅ Check auth status on mount
  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        await api.get(`/api/auth/check-auth`);
        if (mounted) setIsAuthenticated(true);
      } catch (err) {
        if (mounted) setIsAuthenticated(false);
      } finally {
        if (mounted) setLoadingAuth(false);
      }
    };

    checkAuth();
    return () => { mounted = false; };
  }, [setIsAuthenticated]);

  const handleLogout = async () => {
    try {
      await api.get(`/api/auth/logout`);
      setIsAuthenticated(false);
      setMenuOpen(false); // Close menu on logout
      navigate("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <header className="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 shadow-lg fixed top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
        {/* Logo */}
        <div
          onClick={() => navigate("/")}
          className="text-2xl font-extrabold text-white cursor-pointer select-none"
        >
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 via-red-400 to-pink-500">
            Caption
          </span>
          Gen
        </div>

        {/* Desktop Menu */}
        {!loadingAuth && (
          <div className="hidden md:flex items-center space-x-6">
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => navigate('/profile')}
                  className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full font-medium transition transform hover:scale-105"
                >
                  Profile
                </button>
                <button
                  onClick={() => navigate('/history')}
                  className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full font-medium transition transform hover:scale-105"
                >
                  History
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-full font-semibold transition transform hover:scale-105"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onOpenModal("login")}
                  className="text-white hover:text-gray-200 font-medium transition"
                >
                  Log in
                </button>
                <button
                  onClick={() => onOpenModal("signup")}
                  className="bg-white text-purple-600 px-5 py-2 rounded-full font-semibold hover:bg-gray-100 transition transform hover:scale-105"
                >
                  Sign up
                </button>
              </>
            )}
          </div>
        )}

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white hover:text-gray-200 transition"
          onClick={() => !loadingAuth && setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && !loadingAuth && (
        <div className="md:hidden bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 w-full shadow-lg">
          <div className="flex flex-col items-center py-4 space-y-3">
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => { navigate('/profile'); setMenuOpen(false); }}
                  className="text-white w-4/5 py-2 rounded-full font-medium hover:text-gray-200 transition"
                >
                  Profile
                </button>
                <button
                  onClick={() => { navigate('/history'); setMenuOpen(false); }}
                  className="text-white w-4/5 py-2 rounded-full font-medium hover:text-gray-200 transition"
                >
                  History
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white w-4/5 py-2 rounded-full font-semibold transition transform hover:scale-105"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => { onOpenModal("login"); setMenuOpen(false); }}
                  className="text-white hover:text-gray-200 font-medium transition w-4/5 py-2 rounded-full"
                >
                  Log in
                </button>
                <button
                  onClick={() => { onOpenModal("signup"); setMenuOpen(false); }}
                  className="bg-white text-purple-600 w-4/5 py-2 rounded-full font-semibold hover:bg-gray-100 transition transform hover:scale-105"
                >
                  Sign up
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
