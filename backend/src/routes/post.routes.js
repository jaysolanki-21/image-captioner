const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth-middleware");
const {
  uploadImageAndGenerateCaption,
  captionFromUrl,
  deletePostController,
  likePost,
  getLikedPosts
} = require("../controller/post.controller");
const upload = require("../service/multer.config");
const { checkFile, captionFromUrlValidation, runValidation } = require('../middlewares/validators');

// Upload image + caption generation
router.post(
  "/upload",
  authMiddleware,
  upload.single("file"), // frontend sends FormData with "file"
  checkFile,
  uploadImageAndGenerateCaption
);

// Caption from URL (no file upload)
router.post(
  "/caption-from-url",
  authMiddleware,
  captionFromUrlValidation,
  runValidation,
  captionFromUrl
);

// delete a post
router.delete("/my-posts/:id", authMiddleware, deletePostController);

// Like a post
router.post("/like/:postId", authMiddleware, likePost);

//fetch liked posts
router.get("/liked-posts", authMiddleware, getLikedPosts);

module.exports = router;
