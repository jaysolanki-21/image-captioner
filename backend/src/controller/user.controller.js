const usermodel = require("../models/user.model");
const postModel = require("../models/post.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Register
const register = async (req, res) => {
    const { username, email, password, confirmPassword } = req.body;

    if (!username || !email || !password || !confirmPassword) {
        return res.status(400).json({ message: "All fields are required" });
    }

    if (password !== confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match" });
    }

    try {
        const existingUser = await usermodel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new usermodel({ username, email, password: hashedPassword });
        await user.save();

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000
        });

        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};


// Login
const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await usermodel.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000
        });

        res.status(200).json({ message: "Login successful" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Logout
const logout = (req, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict"
        });
        res.status(200).json({ message: "Logout successful" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Profile
const profile = async (req, res) => {
  try {
    const user = req.user; // populated via auth middleware
    if (!user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // Count the number of posts for this user
    const totalGenerated = await postModel.countDocuments({ user: user._id });

    res.status(200).json({
      name: user.username,
      email: user.email,
      totalGenerated, // total number of posts/images uploaded
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};


// Check Auth
const checkAuth = async (req, res) => {
  try {
    const user = req.user; // set by auth middleware
    if (!user) {
      return res.status(200).json({ isAuthenticated: false });
    }

    res.status(200).json({
      isAuthenticated: true,
      user: {
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ isAuthenticated: false });
  }
};

const getUserHistory = async (req, res) => {
  try {
    const user = req.user; // Populated by authMiddleware
    if (!user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // Fetch all posts by this user, sorted by creation date (latest first)
    // Include language so client can sort/filter by language
    const history = await postModel
      .find({ user: user._id })
      .sort({ createdAt: -1 }) // newest first
      .select("image caption createdAt language"); // include language

    // Map to match frontend expected keys
    const formattedHistory = history.map((item) => ({
      imageUrl: item.image,
      caption: item.caption,
      createdAt: item.createdAt,
      postId: item._id,
      language: item.language || 'english'
    }));

    res.status(200).json(formattedHistory);
  } catch (error) {
    console.error("Failed to fetch history:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


module.exports = {
    register,
    login,
    logout,
    profile,
    checkAuth,
    getUserHistory
};
