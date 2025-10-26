// import axios from "axios";
// import { useLocation, useNavigate } from "react-router";
// import { useEffect, useRef, useState } from "react";
// import Header from "./Header";
// import { Heart, Share2, Copy, Zap } from "lucide-react";
// import { toast } from 'react-hot-toast'

// const EditPage = ({ onOpenModal, isAuthenticated, setIsAuthenticated }) => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const fileInputRef = useRef(null);

//   // captions will be array of { text, postId?, liked? }
//   const [captions, setCaptions] = useState([]);
//   const [images, setImages] = useState([]);
//   const [previewImage, setPreviewImage] = useState("");
//   const [isGenerating, setIsGenerating] = useState(false);
//   const [processingLikes, setProcessingLikes] = useState({})

//   const initialImageUrl = location.state?.imageUrl;

//   useEffect(() => {
//     if (!initialImageUrl) {
//       navigate("/");
//     } else {
//       setImages([initialImageUrl]);
//       setPreviewImage(initialImageUrl);
//     }
//   }, [initialImageUrl, navigate]);

//   const handleGenerate = async () => {
//     if (!previewImage) return;

//     setIsGenerating(true);
//     setCaptions([]); // clear previous captions while generating

//     try {
//       let file;

//       if (previewImage.startsWith("data:")) {
//         // Base64 data URL - convert manually
//         const byteString = atob(previewImage.split(",")[1]);
//         const mimeString = previewImage
//           .split(",")[0]
//           .split(":")[1]
//           .split(";")[0];

//         const ab = new ArrayBuffer(byteString.length);
//         const ia = new Uint8Array(ab);
//         for (let i = 0; i < byteString.length; i++) {
//           ia[i] = byteString.charCodeAt(i);
//         }

//         const blob = new Blob([ab], { type: mimeString });
//         file = new File([blob], "uploaded-image.jpg", { type: mimeString });
//       } else {
//         // HTTP/HTTPS URL - fetch normally
//         const blob = await (await fetch(previewImage)).blob();
//         file = new File([blob], "image.jpg", { type: blob.type });
//       }

//       const formData = new FormData();
//       formData.append("file", file);

//       const response = await axios.post(
//         `http://localhost:3000/api/images/upload`,
//         formData,
//         {
//           withCredentials: true,
//           headers: {
//             "Content-Type": "multipart/form-data",
//           },
//         }
//       );

//   const backendCaption = response.data?.caption || 'No caption returned.';
//   const postId = response.data?.postId || response.data?.post?._id || null;
//   // store caption as object
//   setCaptions([{ text: backendCaption, postId, liked: false }]);
//     } catch (err) {
//       console.error("Error generating caption:", err);
//       setCaptions(["Failed to generate caption."]);
//     } finally {
//       setIsGenerating(false);
//     }
//   };

//   const handleAddImageClick = () => {
//     fileInputRef.current?.click();
//   };

//   const handleFileChange = (e) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onload = () => {
//         const imageDataUrl = reader.result;
//         setImages((prev) => [...prev, imageDataUrl]);
//         setPreviewImage(imageDataUrl);
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   // Toggle like via backend for generated captions (optimistic)
//   const handleLike = async (idx) => {
//     const captionObj = captions[idx];
//     if (!captionObj) return;
//     const postId = captionObj.postId;
//     if (!postId) return toast.error('No postId available to like');

//     if (processingLikes[postId]) return;

//     // Optimistic UI
//     const updated = [...captions];
//     updated[idx] = { ...captionObj, liked: !captionObj.liked };
//     setCaptions(updated);
//     setProcessingLikes((p) => ({ ...p, [postId]: true }));

//     try {
//       const res = await axios.post(`http://localhost:3000/api/images/like/${postId}`, {}, { withCredentials: true });
//       toast.success(res?.data?.message || 'Updated');
//     } catch (err) {
//       console.error('Like failed', err);
//       // revert
//       const reverted = [...captions];
//       reverted[idx] = { ...captionObj };
//       setCaptions(reverted);
//       toast.error('Unable to update like');
//     } finally {
//       setProcessingLikes((p) => ({ ...p, [postId]: false }));
//     }
//   }

//   const shareCaption = async (text) => {
//     try {
//       if (navigator.share) {
//         await navigator.share({ title: "Generated Caption", text });
//       } else if (navigator.clipboard) {
//         await navigator.clipboard.writeText(text);
//         toast.info("Caption copied to clipboard");
//       } else {
//         const ta = document.createElement("textarea");
//         ta.value = text;
//         document.body.appendChild(ta);
//         ta.select();
//         document.execCommand("copy");
//         document.body.removeChild(ta);
//         toast.info("Caption copied to clipboard");
//       }
//     } catch (err) {
//       console.error("Share failed", err);
//       toast.error("Unable to share caption");
//     }
//   };

//   const copyCaption = async (text) => {
//     try {
//       if (navigator.clipboard) {
//         await navigator.clipboard.writeText(text);
//         toast.success("Copied!");
//       } else {
//         const ta = document.createElement("textarea");
//         ta.value = text;
//         document.body.appendChild(ta);
//         ta.select();
//         document.execCommand("copy");
//         document.body.removeChild(ta);
//         toast.success("Copied!");
//       }
//     } catch (err) {
//       console.error("Copy failed", err);
//       toast.error("Unable to copy");
//     }
//   };

//   return (
//   <div className="min-h-screen bg-gradient-to-tr from-gray-50 to-gray-100 text-gray-800 flex flex-col pt-20">
//       {/* Header */}
//       <Header
//         onOpenModal={onOpenModal}
//         isAuthenticated={isAuthenticated}
//         setIsAuthenticated={setIsAuthenticated}
//       />

//       {/* Main */}
//   <main className="flex-1 container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-6 lg:items-start lg:divide-x lg:divide-gray-100">
//         {/* Left Column - Image Preview */}
//         <section className="w-full lg:w-2/3 flex flex-col gap-4 lg:pr-6">
//           <div className="bg-white rounded-xl p-4 flex items-center justify-center">
//             {previewImage ? (
//               <img
//                 src={previewImage}
//                 alt="Preview"
//                 className="max-w-full md:max-w-full max-h-[60vh] md:max-h-[420px] object-contain rounded-xl"
//                 style={{ width: '100%', height: 'auto' }}
//               />
//             ) : (
//               <div className="text-center text-gray-400 flex items-center justify-center py-20">
//                 No image selected
//               </div>
//             )}
//           </div>

//           <button
//             onClick={handleGenerate}
//             className={`self-center px-5 py-2 rounded-lg text-sm font-medium inline-flex items-center justify-center gap-2 transition ${
//               isGenerating
//                 ? "bg-gray-300 text-gray-600 cursor-not-allowed"
//                 : "bg-blue-600 text-white hover:bg-blue-700"
//             }`}
//             disabled={isGenerating}
//             aria-busy={isGenerating}
//           >
//             {isGenerating ? (
//               <>
//                 <svg
//                   className="w-5 h-5 animate-spin text-white"
//                   viewBox="0 0 24 24"
//                   aria-hidden
//                 >
//                   <circle
//                     className="opacity-25"
//                     cx="12"
//                     cy="12"
//                     r="10"
//                     stroke="currentColor"
//                     strokeWidth="4"
//                     fill="none"
//                   ></circle>
//                   <path
//                     className="opacity-75"
//                     fill="currentColor"
//                     d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
//                   ></path>
//                 </svg>
//                 <span className="text-sm">Generating...</span>
//               </>
//             ) : (
//               <>
//                 <Zap className="w-5 h-5 text-white" />
//                 <span>Generate Captions</span>
//               </>
//             )}
//           </button>
//         </section>

//         {/* Right Column - Captions */}
//   <aside className="w-full lg:w-1/3 bg-white rounded-xl p-6 shadow-lg lg:pl-6">
//           {/* Captions Section */}
//           <section>
//             <h2 className="text-xl font-semibold mb-4 text-gray-800">
//               📝 Captions
//             </h2>

//             {isGenerating ? (
//               <div className="flex items-center justify-center h-40">
//                 <svg
//                   className="w-10 h-10 animate-spin text-blue-600"
//                   viewBox="0 0 24 24"
//                   aria-hidden
//                 >
//                   <circle
//                     className="opacity-25"
//                     cx="12"
//                     cy="12"
//                     r="10"
//                     stroke="currentColor"
//                     strokeWidth="4"
//                     fill="none"
//                   ></circle>
//                   <path
//                     className="opacity-75"
//                     fill="currentColor"
//                     d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
//                   ></path>
//                 </svg>
//                 <span className="ml-3 text-gray-600">
//                   Generating caption...
//                 </span>
//               </div>
//             ) : captions.length > 0 ? (
//               <ul className="space-y-4">
//                 {captions.map((captionObj, idx) => (
//                   <li
//                     key={idx}
//                     className="bg-gradient-to-br from-white to-gray-50 px-4 py-3 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200"
//                   >
//                     <div className="flex flex-col md:flex-row md:items-start md:gap-4">
//                       <div className="flex-1">
//                         <textarea
//                           value={captionObj.text}
//                           onChange={(e) => {
//                             const updated = [...captions];
//                             updated[idx] = { ...captionObj, text: e.target.value };
//                             setCaptions(updated);
//                           }}
//                           rows={4}
//                           className="w-full resize-y min-h-[60px] max-h-[220px] rounded-md bg-white text-gray-800 border border-gray-200 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-400 p-3 text-sm leading-relaxed shadow-sm transition"
//                           placeholder="Edit your caption..."
//                         />
//                         <div className="text-xs text-gray-400 mt-2">
//                           ✏️ Tip: edit the caption before copying or sharing.
//                         </div>
//                       </div>

//                       <div className="mt-3 md:mt-0 flex items-center gap-2 md:flex-col md:justify-start">
//                         <button
//                           onClick={() => handleLike(idx)}
//                           className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${
//                             captionObj.liked
//                               ? "bg-red-50 text-red-600"
//                               : "bg-white text-gray-700 border border-gray-100 hover:bg-gray-50"
//                           }`}
//                           aria-pressed={!!captionObj.liked}
//                           disabled={!!processingLikes[captionObj.postId]}
//                           title={captionObj.liked ? "Unlike" : "Like"}
//                         >
//                           {captionObj.liked ? (
//                             <Heart className="w-5 h-5 text-red-600" fill="currentColor" />
//                           ) : (
//                             <Heart className="w-5 h-5 text-gray-500" fill="none" />
//                           )}
//                           <span className="hidden md:inline text-sm">
//                             {captionObj.liked ? "Liked" : "Like"}
//                           </span>
//                         </button>

//                         <button
//                           onClick={() => shareCaption(captionObj.text)}
//                           className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white text-gray-700 border border-gray-100 hover:bg-gray-50 transition"
//                           title="Share"
//                         >
//                           <Share2 className="w-5 h-5 text-indigo-600" />
//                           <span className="hidden md:inline text-sm">
//                             Share
//                           </span>
//                         </button>

//                         <button
//                           onClick={() => copyCaption(captionObj.text)}
//                           className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white text-gray-700 border border-gray-100 hover:bg-gray-50 transition"
//                           title="Copy"
//                         >
//                           <Copy className="w-5 h-5" />
//                           <span className="hidden md:inline text-sm">Copy</span>
//                         </button>
//                       </div>
//                     </div>
//                   </li>
//                 ))}
//               </ul>
//             ) : (
//               <p className="text-sm text-gray-500 text-center mt-6">
//                 Click{" "}
//                 <span className="font-medium text-blue-600">
//                   &quot;Generate Captions&quot;
//                 </span>{" "}
//                 to view suggestions.
//               </p>
//             )}
//           </section>
//           {/* Divider between captions and images */}
//           <div className="border-t border-gray-100 my-4" />

//           {/* Image Section */}
//           <section className="mb-6">
//             <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
//               🖼️ Your Images
//             </h2>
//             <div className="flex items-center gap-4 flex-wrap">
//               {images.map((img, index) => (
//                 <div
//                   key={index}
//                   className={`w-16 h-16 rounded-lg overflow-hidden cursor-pointer border ${
//                     img === previewImage
//                       ? "ring-2 ring-blue-500"
//                       : "border-gray-200"
//                   } hover:ring-2 hover:ring-blue-400 transition-all`}
//                   onClick={() => setPreviewImage(img)}
//                   title="Click to preview"
//                 >
//                   <img
//                     src={img}
//                     alt={`Thumbnail ${index + 1}`}
//                     className="w-full h-full object-cover"
//                   />
//                 </div>
//               ))}

//               {/* Add Image Button */}
//               <button
//                 onClick={handleAddImageClick}
//                 className="w-16 h-16 bg-blue-50 border border-dashed border-blue-400 rounded-lg flex items-center justify-center text-2xl text-blue-500 hover:bg-blue-100 transition"
//                 aria-label="Add New Image"
//               >
//                 +
//               </button>
//               <input
//                 type="file"
//                 accept="image/*"
//                 ref={fileInputRef}
//                 className="hidden"
//                 onChange={handleFileChange}
//               />
//             </div>
//           </section>
//         </aside>
//       </main>
//     </div>
//   );
// };

// export default EditPage;

import axios from "axios";
import { useLocation, useNavigate } from "react-router";
import { useEffect, useRef, useState } from "react";
import Header from "./Header";
import { Heart, Share2, Copy, Zap, Languages } from "lucide-react";
import { toast } from "react-hot-toast";
import api from "../lib/api";
import Confetti from "react-confetti"; 

const EditPage = ({ onOpenModal, isAuthenticated, setIsAuthenticated }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [captions, setCaptions] = useState([]);
  const [images, setImages] = useState([]);
  const [previewImage, setPreviewImage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [processingLikes, setProcessingLikes] = useState({});
  const [language, setLanguage] = useState("english");
  const [showConfetti, setShowConfetti] = useState(false);
  const initialImageUrl = location.state?.imageUrl;

  useEffect(() => {
    if (!initialImageUrl) {
      navigate("/");
    } else {
      setImages([initialImageUrl]);
      setPreviewImage(initialImageUrl);
    }
  }, [initialImageUrl, navigate]);

  // ✅ Generate caption
 const handleGenerate = async () => {
    if (!previewImage) return;
    setIsGenerating(true);
    setCaptions([]);
    setShowConfetti(false); // reset confetti

    try {
      let file;

      if (previewImage.startsWith("data:")) {
        const byteString = atob(previewImage.split(",")[1]);
        const mimeString = previewImage.split(",")[0].split(":")[1].split(";")[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
        const blob = new Blob([ab], { type: mimeString });
        file = new File([blob], "uploaded-image.jpg", { type: mimeString });
      } else {
        const blob = await (await fetch(previewImage)).blob();
        file = new File([blob], "image.jpg", { type: blob.type });
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("language", language);

      const response = await api.post(`/api/images/upload`, formData, {
        withCredentials: true, // send cookies
        headers: { "Content-Type": "multipart/form-data" },
      });

      const backendCaption = response.data?.caption || "No caption returned.";
      const postId = response.data?.postId || response.data?.post?._id || null;
      setCaptions([{ text: backendCaption, postId, liked: false }]);

      // ✅ Trigger confetti animation
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000); // stop after 5s
    } catch (err) {
      console.error("Error generating caption:", err);
      toast.error("Failed to generate caption.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddImageClick = () => fileInputRef.current?.click();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const imageDataUrl = reader.result;
        setImages((prev) => [...prev, imageDataUrl]);
        setPreviewImage(imageDataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLike = async (idx) => {
    const captionObj = captions[idx];
    if (!captionObj?.postId) return toast.error("No postId available to like");
    if (processingLikes[captionObj.postId]) return;

    const updated = [...captions];
    updated[idx] = { ...captionObj, liked: !captionObj.liked };
    setCaptions(updated);
    setProcessingLikes((p) => ({ ...p, [captionObj.postId]: true }));

    try {
      const res = await api.post(
        `/api/images/like/${captionObj.postId}`,
        {}, 
        { withCredentials: true } 
      );

      toast.success(res?.data?.message || "Updated");
    } catch (err) {
      console.error("Like failed", err);
      toast.error("Unable to update like");
      const reverted = [...captions];
      reverted[idx] = { ...captionObj };
      setCaptions(reverted);
    } finally {
      setProcessingLikes((p) => ({ ...p, [captionObj.postId]: false }));
    }
  };

  const shareCaption = async (text) => {
    try {
      if (navigator.share) {
        await navigator.share({ title: "Generated Caption", text });
      } else {
        await navigator.clipboard.writeText(text);
        toast.success("Caption copied to clipboard");
      }
    } catch (err) {
      console.error("Share failed", err);
      toast.error("Unable to share caption");
    }
  };

  const copyCaption = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied!");
    } catch {
      toast.error("Unable to copy");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-50 via-gray-100 to-slate-200 text-gray-800 flex flex-col pt-20">
       {showConfetti && <Confetti numberOfPieces={200} gravity={0.3} />}
      <Header
        onOpenModal={onOpenModal}
        isAuthenticated={isAuthenticated}
        setIsAuthenticated={setIsAuthenticated}
      />

      <main className="flex-1 container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-6 lg:items-start lg:divide-x lg:divide-gray-100">
        {/* Left: Image + Controls */}
        <section className="w-full lg:w-2/3 flex flex-col gap-6 lg:pr-6">
          <div className="bg-white rounded-xl p-4 shadow-md flex items-center justify-center border border-gray-100">
            {previewImage ? (
              <img
                src={previewImage}
                alt="Preview"
                className="max-w-full max-h-[60vh] object-contain rounded-lg"
              />
            ) : (
              <p className="text-gray-400 py-20">No image selected</p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className={`px-6 py-2 rounded-lg text-white font-medium flex items-center gap-2 transition ${
                isGenerating
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 shadow-md"
              }`}
            >
              {isGenerating ? (
                <>
                  <svg
                    className="w-5 h-5 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      className="opacity-25"
                    />
                    <path
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      className="opacity-75"
                    />
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  Generate Caption
                </>
              )}
            </button>
          </div>
        </section>

        {/* Right: Captions and Image Section */}
        <aside className="w-full lg:w-1/3 bg-white rounded-xl p-6 shadow-lg lg:pl-6 border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              📝 Generated Captions
            </h2>
            <div className="flex items-center gap-3">
              <Languages className="w-5 h-5 text-indigo-600" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-sm"
              >
                <option value="english">English</option>
                <option value="hindi">Hindi</option>
                <option value="gujarati">Gujarati</option>
              </select>
            </div>
          </div>

          {isGenerating ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-indigo-500 border-opacity-70"></div>
              <span className="ml-3 text-gray-600">Generating caption...</span>
            </div>
          ) : captions.length > 0 ? (
            <ul className="space-y-4">
              {captions.map((captionObj, idx) => (
                <li
                  key={idx}
                  className="p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition"
                >
                  <textarea
                    value={captionObj.text}
                    onChange={(e) => {
                      const updated = [...captions];
                      updated[idx] = { ...captionObj, text: e.target.value };
                      setCaptions(updated);
                    }}
                    rows={4}
                    className="w-full bg-white text-gray-700 border border-gray-200 rounded-md p-3 text-sm resize-y focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none"
                  />
                  <div className="flex justify-end gap-2 mt-3">
                    <button
                      onClick={() => handleLike(idx)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${
                        captionObj.liked
                          ? "bg-red-100 text-red-600"
                          : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <Heart
                        className={`w-5 h-5 ${
                          captionObj.liked ? "fill-red-600" : ""
                        }`}
                      />
                      Like
                    </button>
                    <button
                      onClick={() => shareCaption(captionObj.text)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 text-sm"
                    >
                      <Share2 className="w-5 h-5" /> Share
                    </button>
                    <button
                      onClick={() => copyCaption(captionObj.text)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 text-sm"
                    >
                      <Copy className="w-5 h-5" /> Copy
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 text-center mt-6">
              Click{" "}
              <span className="text-indigo-600 font-medium">Generate</span> to
              create captions.
            </p>
          )}

          {/* Divider */}
          <div className="border-t border-gray-100 my-4" />

          {/* Image Section */}
          <section className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              🖼️ Your Images
            </h2>
            <div className="flex items-center gap-4 flex-wrap">
              {images.map((img, index) => (
                <div
                  key={index}
                  className={`w-16 h-16 rounded-lg overflow-hidden cursor-pointer border ${
                    img === previewImage
                      ? "ring-2 ring-blue-500"
                      : "border-gray-200"
                  } hover:ring-2 hover:ring-blue-400 transition-all`}
                  onClick={() => setPreviewImage(img)}
                  title="Click to preview"
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}

              {/* Add Image Button */}
              <button
                onClick={handleAddImageClick}
                className="w-16 h-16 bg-blue-50 border border-dashed border-blue-400 rounded-lg flex items-center justify-center text-2xl text-blue-500 hover:bg-blue-100 transition"
                aria-label="Add New Image"
              >
                +
              </button>

              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </section>
        </aside>
      </main>
    </div>
  );
};

export default EditPage;
