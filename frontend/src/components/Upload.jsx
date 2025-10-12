import { useRef, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from 'react-hot-toast'
import api from '../lib/api'
import { motion } from "framer-motion";

const Upload = () => {
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [imageUrlInput, setImageUrlInput] = useState("");

  // Trigger file input immediately (direct user interaction)
  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  // Handle actual file selection
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    try {
      // Check if user is authenticated
      const res = await api.get(`/api/auth/check-auth`);

      if (!res.data.isAuthenticated) {
        toast.error("Please log in first.");
        return;
      }

      // Navigate to uploads page with image
      const imageUrl = URL.createObjectURL(file);
      navigate("/uploads", { state: { imageUrl } });
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Try again.");
    }
  };

  // Handle sample image selection
  const handleSampleImageClick = async (url) => {
    try {
      const res = await api.get(`/api/auth/check-auth`);

      if (!res.data.isAuthenticated) {
        toast.error("Please log in first.");
        return;
      }

      navigate("/uploads", { state: { imageUrl: url } });
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Try again.");
    }
  };

  // Handle generate from URL
  const handleGenerateFromUrl = async () => {
    if (!imageUrlInput) {
      setError("Please enter an image URL.");
      return;
    }

    // basic URL validation
    try {
      // eslint-disable-next-line no-new
      new URL(imageUrlInput);
    } catch (e) {
      setError("Please enter a valid URL.");
      return;
    }

    try {
      const res = await api.get(`/api/auth/check-auth`);

      if (!res.data.isAuthenticated) {
        toast.error("Please log in first.");
        return;
      }

      navigate("/uploads", { state: { imageUrl: imageUrlInput } });
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Try again.");
    }
  };

  // Drag & Drop support
  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileChange({ target: { files: [file] } });
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <section className="flex flex-col items-center justify-center text-center px-4 py-16 bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen">
      <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-8 max-w-2xl leading-snug">
        Upload an image to <span className="text-blue-600">generate a caption</span>
      </h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-3xl flex flex-col lg:flex-row gap-8 items-center"
      >
        {/* Upload Area */}
        <div
          className="flex-1 flex flex-col items-center justify-center bg-white border-2 border-dashed border-gray-300 rounded-xl p-8 hover:border-blue-500 transition cursor-pointer"
          onClick={handleButtonClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <img
            src="https://cdn-icons-png.flaticon.com/512/136/136524.png"
            alt="Upload Icon"
            className="w-16 h-16 mb-4 opacity-70"
          />
          <p className="text-gray-500 mb-2">Click here to upload an image</p>
          <p className="text-gray-400 text-sm">or drag & drop / paste image URL</p>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Sample Images */}
        <div className="flex-1 flex flex-col items-center">
          <p className="text-gray-600 mb-4 font-medium">No image? Try one of these:</p>
          <div className="flex gap-4 flex-wrap justify-center">
            {[
              "https://ik.imagekit.io/wr6ziyjiu/img2.jpg?updatedAt=1754473053956",
              "https://ik.imagekit.io/wr6ziyjiu/img1.jpg?updatedAt=1754473053969",
              "https://ik.imagekit.io/wr6ziyjiu/img3.jpg?updatedAt=1754473053917",
            ].map((url, idx) => (
              <motion.img
                key={idx}
                src={url}
                alt={`Sample ${idx + 1}`}
                onClick={() => handleSampleImageClick(url)}
                className="h-20 w-20 object-cover rounded-lg cursor-pointer shadow-md hover:scale-105 transition-transform"
                whileHover={{ scale: 1.1 }}
              />
            ))}
          </div>

          {/* Generate from URL */}
          <div className="mt-6 w-full max-w-sm">
            <label className="sr-only">Image URL</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Paste image URL and press Generate"
                value={imageUrlInput}
                onChange={(e) => { setImageUrlInput(e.target.value); setError(''); }}
                className="flex-1 px-3 py-2 rounded-md border border-gray-300 bg-white/80 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                onClick={handleGenerateFromUrl}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
              >
                Generate
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {error && <p className="text-red-500 mt-6">{error}</p>}
    </section>
  );
};

export default Upload;
