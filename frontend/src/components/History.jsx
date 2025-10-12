import { useEffect, useState } from "react";
import api from "../lib/api";
import { Download, Heart, Share2 } from "lucide-react";
import CaptionModal from "./CaptionModal";
import { toast } from "react-hot-toast";

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likes, setLikes] = useState({}); // like state keyed by postId
  const [processingLikes, setProcessingLikes] = useState({}); // disable while request in flight
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  // Filters & sorting
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [sortBy, setSortBy] = useState("newest"); // 'newest' | 'oldest'
  const [languageFilter, setLanguageFilter] = useState("all"); // 'all' | 'english' | 'hindi' | 'gujarati'

  // Download caption as a .txt file
  const downloadCaption = (item) => {
    try {
      const filename = `caption-${new Date(item.createdAt).toISOString()}.txt`;
      const content = `Caption: ${item.caption}\n\nGenerated: ${new Date(
        item.createdAt
      ).toLocaleString()}\nImage: ${item.imageUrl}`;
      const blob = new Blob([content], { type: "text/plain;charset=utf-8" });

      // Create a temporary link and trigger download
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download caption", err);
      toast.error("Unable to download caption");
    }
  };

  // Toggle like via backend endpoint (optimistic UI)
  const handleLike = async (item) => {
    const postId = item?._id || item?.id || item?.postId;
    if (!postId) return toast.error("Post id missing");

    // Prevent duplicate requests
    if (processingLikes[postId]) return;

    // optimistic update
    setLikes((prev) => ({ ...prev, [postId]: !prev[postId] }));
    setProcessingLikes((prev) => ({ ...prev, [postId]: true }));

    try {
      const res = await api.post(`/api/images/like/${postId}`);
      const msg = res?.data?.message || "Updated";
      toast.success(msg);
    } catch (err) {
      console.error("Like failed", err);
      // revert optimistic
      setLikes((prev) => ({ ...prev, [postId]: !prev[postId] }));
      toast.error("Unable to update like");
    } finally {
      setProcessingLikes((prev) => ({ ...prev, [postId]: false }));
    }
  };

  // Share caption using Web Share API with clipboard fallback
  const shareCaption = async (item) => {
    const shareText = `${item.caption}\n\nGenerated: ${new Date(
      item.createdAt
    ).toLocaleString()}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Generated Caption", text: shareText });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareText);
        alert("Caption copied to clipboard");
      } else {
        // Fallback create temporary textarea
        const ta = document.createElement("textarea");
        ta.value = shareText;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        alert("Caption copied to clipboard");
      }
    } catch (err) {
      console.error("Share failed", err);
      alert("Unable to share caption");
    }
  };

  const copyCaption = async (text) => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard");
      } else {
        const ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        toast.success("Copied to clipboard");
      }
    } catch (err) {
      console.error("Copy failed", err);
      toast.error("Unable to copy");
    }
  };

  useEffect(() => {
    // Fetch history and liked posts in parallel so we can pre-populate favourite state
    const fetchAll = async () => {
      try {
        const [histRes, likedRes] = await Promise.all([
          api.get("/api/auth/history"),
          api.get("/api/images/liked-posts").catch(() => ({ data: [] })),
        ]);

        const hist = histRes?.data || [];
        setHistory(hist);

        // likedRes may return array of post objects
        const likedArray = likedRes?.data || [];
        const likedIds = {};
        if (Array.isArray(likedArray)) {
          likedArray.forEach((p) => {
            const id = p?._id || p?.id || p?.postId;
            if (id) likedIds[id] = true;
          });
        }

        // Also check history items for any liked flag
        hist.forEach((it) => {
          if (it?.liked || it?.isLiked) {
            const id = it?._id || it?.id || it?.postId;
            if (id) likedIds[id] = true;
          }
        });

        setLikes(likedIds);
      } catch (err) {
        console.error("Failed to fetch history/likes", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;

  // apply filters and sorting before pagination
  const filtered = history.filter((item) => {
    // favourite filter
    if (onlyFavorites) {
      const id = item?._id || item?.id || item?.postId;
      if (!id || !likes[id]) return false;
    }
    // language filter
    if (languageFilter && languageFilter !== "all") {
      const lang = (item.language || "english").toLowerCase();
      if (lang !== languageFilter) return false;
    }
    return true;
  });

  const sorted = filtered.sort((a, b) => {
    const ta = new Date(a.createdAt).getTime() || 0;
    const tb = new Date(b.createdAt).getTime() || 0;
    return sortBy === "newest" ? tb - ta : ta - tb;
  });

  // pagination calculations based on filtered/sorted list
  const totalItems = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const normalizedPage = Math.min(Math.max(1, page), totalPages);
  // if page changed out of range, clamp it
  if (normalizedPage !== page) setPage(normalizedPage);
  const start = (normalizedPage - 1) * pageSize;
  const end = start + pageSize;
  const pageItems = sorted.slice(start, end);

  return (
    <section className="max-w-5xl mx-auto p-6 pt-20">
      <h2 className="text-2xl font-bold mb-4 mt-3">
        Generated Captions History
      </h2>

      {history.length === 0 ? (
        <div className="bg-white p-6 rounded shadow">No history found.</div>
      ) : (
        <>
          {/* Filter & Sort Controls */}
          {/* 🔍 Filters & Sorting Section */}
          <div className="mb-6 bg-white shadow-sm rounded-2xl p-4 border border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              {/* Sorting */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-600">
                  Sort by:
                </span>
                <div className="inline-flex bg-gray-50 rounded-full border border-gray-200 p-1 shadow-inner">
                  <button
                    onClick={() => {
                      setSortBy("newest");
                      setPage(1);
                    }}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                      sortBy === "newest"
                        ? "bg-blue-600 text-white shadow-md"
                        : "text-gray-700 hover:bg-white hover:shadow-sm"
                    }`}
                  >
                    🕒 Newest
                  </button>
                  <button
                    onClick={() => {
                      setSortBy("oldest");
                      setPage(1);
                    }}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                      sortBy === "oldest"
                        ? "bg-blue-600 text-white shadow-md"
                        : "text-gray-700 hover:bg-white hover:shadow-sm"
                    }`}
                  >
                    📅 Oldest
                  </button>
                </div>
              </div>

              {/* Language Filter */}
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-600">
                  Language:
                </label>
                <select
                  value={languageFilter}
                  onChange={(e) => {
                    setLanguageFilter(e.target.value);
                    setPage(1);
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-xl text-sm bg-gray-50 text-gray-800 hover:border-blue-400 focus:ring-2 focus:ring-blue-300 focus:outline-none transition-all duration-200"
                >
                  <option value="all">🌍 All</option>
                  <option value="english">🇬🇧 English</option>
                  <option value="hindi">🇮🇳 Hindi</option>
                  <option value="gujarati">🇮🇳 Gujarati</option>
                </select>
              </div>

              {/* Favourites Toggle */}
              <button
                onClick={() => {
                  setOnlyFavorites((v) => !v);
                  setPage(1);
                }}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 shadow-sm border ${
                  onlyFavorites
                    ? "bg-yellow-100 border-yellow-300 text-yellow-800 hover:bg-yellow-200"
                    : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {onlyFavorites ? "★ Showing Favourites" : "☆ Show Favourites"}
              </button>
            </div>
          </div>

          {/* Mobile: stacked cards */}
          <div className="md:hidden space-y-4">
            {pageItems.map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded shadow p-4 flex gap-4 items-start"
              >
                <img
                  src={item.imageUrl}
                  alt={`thumb-${idx}`}
                  className="w-24 h-20 object-cover rounded flex-shrink-0"
                />
                <div className="flex-1">
                  <p
                    className="text-sm text-gray-700 mb-2 cursor-pointer"
                    onClick={() => {
                      setSelectedItem(item);
                      setModalOpen(true);
                    }}
                  >
                    {item.caption}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-400 mb-3">
                      {new Date(item.createdAt).toLocaleString()}
                    </p>
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      {(item.language || "english").toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleLike(item)}
                      className="flex items-center gap-2 text-sm text-gray-700 hover:text-red-600"
                      aria-pressed={
                        !!likes[item?._id || item?.id || item?.postId]
                      }
                      disabled={
                        !!processingLikes[item?._id || item?.id || item?.postId]
                      }
                    >
                      {likes[item?._id || item?.id || item?.postId] ? (
                        <Heart
                          className="w-4 h-4 text-red-600"
                          fill="currentColor"
                        />
                      ) : (
                        <Heart className="w-4 h-4 text-gray-400" fill="none" />
                      )}
                      <span>
                        {likes[item?._id || item?.id || item?.postId]
                          ? "Liked"
                          : "Like"}
                      </span>
                    </button>

                    <button
                      onClick={() => shareCaption(item)}
                      className="flex items-center gap-2 text-sm text-gray-700 hover:text-indigo-600"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Share</span>
                    </button>

                    <button
                      onClick={() => downloadCaption(item)}
                      className="inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white rounded ml-2 w-10 h-10 p-2 shadow-sm"
                      aria-label="Download caption"
                      title="Download caption"
                    >
                      <Download className="w-5 h-5" />
                      <span className="sr-only">Download</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: table */}
          <div className="hidden md:block overflow-x-auto bg-white rounded shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Image
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Caption
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pageItems.map((item, idx) => (
                  <tr key={idx}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <img
                        src={item.imageUrl}
                        alt={`thumb-${idx}`}
                        className="h-20 w-28 object-cover rounded"
                      />
                    </td>
                    <td
                      className="px-6 py-4 max-w-xl break-words cursor-pointer"
                      onClick={() => {
                        setSelectedItem(item);
                        setModalOpen(true);
                      }}
                    >
                      {item.caption}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                          {new Date(item.createdAt).toLocaleString()}
                        </span>
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {(item.language || "english").toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleLike(item)}
                          className="flex items-center gap-2 text-sm text-gray-700 hover:text-red-600"
                          aria-pressed={
                            !!likes[item?._id || item?.id || item?.postId]
                          }
                          disabled={
                            !!processingLikes[
                              item?._id || item?.id || item?.postId
                            ]
                          }
                        >
                          {likes[item?._id || item?.id || item?.postId] ? (
                            <Heart
                              className="w-4 h-4 text-red-600"
                              fill="currentColor"
                            />
                          ) : (
                            <Heart
                              className="w-4 h-4 text-gray-400"
                              fill="none"
                            />
                          )}
                          <span>
                            {likes[item?._id || item?.id || item?.postId]
                              ? "Liked"
                              : "Like"}
                          </span>
                        </button>

                        <button
                          onClick={() => shareCaption(item)}
                          className="flex items-center gap-2 text-sm text-gray-700 hover:text-indigo-600"
                        >
                          <Share2 className="w-4 h-4" />
                          <span>Share</span>
                        </button>

                        <button
                          onClick={() => downloadCaption(item)}
                          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded ml-2"
                        >
                          <Download className="w-4 h-4" />
                          <span className="text-sm">Download</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination controls */}
          <div className="mt-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Items per page:</label>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="border rounded px-2 py-1 text-sm"
              >
                <option value={4}>4</option>
                <option value={6}>6</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={normalizedPage === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 bg-white border rounded disabled:opacity-50"
              >
                Prev
              </button>

              {/* page numbers - show compact when many pages */}
              <div className="hidden sm:flex items-center gap-1">
                {Array.from({ length: totalPages }).map((_, i) => {
                  const p = i + 1;
                  const isActive = p === normalizedPage;
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`px-3 py-1 rounded ${
                        isActive ? "bg-blue-600 text-white" : "bg-white border"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>

              <button
                disabled={normalizedPage === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1 bg-white border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
      <CaptionModal
        item={selectedItem}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onLike={(it) => handleLike(it)}
        onShare={(it) => shareCaption(it)}
        onCopy={(text) => copyCaption(text)}
        onDownload={(it) => downloadCaption(it)}
        liked={
          likes[selectedItem?._id || selectedItem?.id || selectedItem?.postId]
        }
      />
    </section>
  );
};

export default History;
