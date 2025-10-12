import React from 'react'
import { Download, Heart, Share2, Copy } from 'lucide-react'

export default function CaptionModal({ item, open, onClose, onLike, onShare, onCopy, onDownload, liked }) {
  if (!open || !item) return null

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-4 sm:p-6 mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-semibold">Caption preview</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">✕</button>
        </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1 flex items-center justify-center">
            <img src={item.imageUrl} alt="preview" className="w-full h-auto max-h-48 object-contain rounded" />
          </div>
          <div className="md:col-span-2">
            <p className="text-gray-800 mb-4">{item.caption}</p>

            <div className="flex items-center gap-3">
              <button onClick={() => onLike && onLike(item)} className={`flex items-center gap-2 px-3 py-2 rounded ${liked ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-700'}`}>
                {liked ? (
                  <Heart className="w-5 h-5 text-red-600" fill="currentColor" />
                ) : (
                  <Heart className="w-5 h-5 text-gray-700" fill="none" />
                )}
                <span className="hidden sm:inline">{liked ? 'Liked' : 'Like'}</span>
              </button>

              {(() => {
                const copyText = item?.caption
                const shareItem = item
                const downloadItem = item
                return (
                  <>
                    <button onClick={() => onShare && onShare(shareItem)} className="flex items-center gap-2 px-3 py-2 rounded bg-gray-100 text-gray-700">
                      <Share2 className="w-5 h-5 text-indigo-600" />
                      <span className="hidden sm:inline">Share</span>
                    </button>

                    <button onClick={() => onCopy && onCopy(copyText)} className="flex items-center gap-2 px-3 py-2 rounded bg-gray-100 text-gray-700">
                      <Copy className="w-5 h-5" />
                      <span className="hidden sm:inline">Copy</span>
                    </button>

                    <button onClick={() => onDownload && onDownload(downloadItem)} className="flex items-center gap-2 px-3 py-2 rounded bg-indigo-600 text-white">
                      <Download className="w-5 h-5" />
                      <span className="hidden sm:inline">Download</span>
                    </button>
                  </>
                )
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
