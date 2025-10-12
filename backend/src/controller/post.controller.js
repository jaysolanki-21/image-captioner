const postModel = require("../models/post.model");
const userModel = require("../models/user.model");
const generateCaption = require("../service/ai.service");
const { uploadImage, imagekit } = require("../service/storage.service");
const uuid = require("uuid");
const axios = require("axios");

// POST /api/images/upload
async function uploadImageAndGenerateCaption(req, res) {
  try {
    const file = req.file;
    const user = req.user._id;

    if (!file) {
      return res.status(400).json({ success: false, message: "Image file is required" });
    }

    // Convert image buffer to base64
    const base64Image = Buffer.from(file.buffer).toString("base64");

    // Upload to ImageKit (or your storage service)
    const uploaded = await uploadImage(base64Image, uuid.v4());

    // Accept language preference (default english)
    const language = req.body?.language || "english";

    // Generate caption using AI service
    const caption = (await generateCaption(base64Image, language)) || "No caption generated.";

    // Save to database (including language)
    const post = await postModel.create({
      image: uploaded.url,
      caption,
      language,
      user,
      fileId: uploaded.fileId,
    });

    res.status(201).json({
      success: true,
      message: "Image uploaded and caption generated successfully",
      imageUrl: uploaded.url,
      caption,
      postId: post._id,
    });
  } catch (err) {
    console.error("Create post error:", err);
    res.status(500).json({ success: false, message: "Failed to upload image" });
  }
}

// POST /api/images/caption-from-url
async function captionFromUrl(req, res) {
  try {
    const { url } = req.body;
    const user = req.user._id;

    if (!url) return res.status(400).json({ message: "Image URL is required" });

    // Fetch image data from URL and convert to base64
    const imageResponse = await axios.get(url, { responseType: "arraybuffer" });
    const base64Image = Buffer.from(imageResponse.data, "binary").toString("base64");

    const language = req.body?.language || "english";

    // Generate caption using AI service
    const caption = await generateCaption(base64Image, language);

    // Save in DB
    const post = await postModel.create({
      image: url,
      caption,
      language,
      user,
      fileId: null,
    });

    res.status(201).json({ imageUrl: url, caption, post });
  } catch (error) {
    console.error("Caption from URL error:", error);
    res.status(500).json({ message: "Failed to generate caption from URL" });
  }
}

// DELETE /api/images/my-posts/:id
async function deletePostController(req, res) {
  try {
    const postId = req.params.id;
    const post = await postModel.findById(postId);

    if (!post) return res.status(404).json({ success: false, message: "Post not found" });
    if (post.user.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: "Unauthorized" });

    if (post.fileId) await imagekit.deleteFile(post.fileId);
    await postModel.findByIdAndDelete(postId);

    res.status(200).json({ success: true, message: "Post deleted successfully" });
  } catch (err) {
    console.error("Delete post error:", err);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
}

// POST /api/images/like/:postId
async function likePost(req, res) {
  try {
    const userId = req.user._id;
    const { postId } = req.params;

    const user = await userModel.findById(userId);
    const post = await postModel.findById(postId);

    if (!post) return res.status(404).json({ message: "Post not found" });

    const alreadyLiked = user.likes.includes(postId);

    if (alreadyLiked) {
      user.likes = user.likes.filter((id) => id.toString() !== postId);
      await user.save();
      return res.status(200).json({ message: "Post unliked" });
    } else {
      user.likes.push(postId);
      await user.save();
      return res.status(200).json({ message: "Post liked" });
    }
  } catch (error) {
    console.error("Error liking post:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// GET /api/images/liked-posts
async function getLikedPosts(req, res) {
  try {
    const userId = req.user._id;
    const user = await userModel.findById(userId).populate({
      path: "likes",
      populate: { path: "user", select: "name email" },
    });
    const likedPosts = user.likes;
    res.status(200).json(likedPosts);
  } catch (error) {
    console.error("Error getting liked posts:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

module.exports = {
  uploadImageAndGenerateCaption,
  captionFromUrl,
  deletePostController,
  likePost,
  getLikedPosts,
};
