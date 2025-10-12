import { useEffect, useState } from "react";
import AuthModal from "./components/AuthModal";
import Header from "./components/Header";
import Upload from "./components/Upload";
import Profile from "./components/Profile";
import History from "./components/History";
import { Route, Routes } from "react-router";
import EditPage from "./components/EditPage";
import ErrorPage from "./components/ErrorPage";
import Cookies from "js-cookie";

const App = () => {
  const [modalType, setModalType] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = Cookies.get("token"); // 'token' should match your cookie name
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  return (
  <div className="min-h-screen bg-white text-gray-900">

      <Header
        onOpenModal={setModalType}
        isAuthenticated={isAuthenticated}
        setIsAuthenticated={setIsAuthenticated}
      />
      <AuthModal
        type={modalType}
        onOpenModal={setModalType}
        onClose={() => setModalType(null)}
        setIsAuthenticated={setIsAuthenticated}
      />

      <Routes>
        <Route path="/" element={<Upload />} />

        <Route
          path="/uploads"
          element={
            <EditPage
              onOpenModal={setModalType}
              isAuthenticated={isAuthenticated}
              setIsAuthenticated={setIsAuthenticated}
            />
          }
        />

        <Route path="/profile" element={<Profile />} />
        <Route path="/history" element={<History />} />

        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </div>
  );
};

export default App;
