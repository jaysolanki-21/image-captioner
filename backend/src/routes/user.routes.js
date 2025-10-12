const { Router } = require("express");
const userController = require("../controller/user.controller");

const authMiddleware = require("../middlewares/auth-middleware");

const router = Router();
const { authLimiter } = require('../middlewares/rateLimiter');
const { registerValidation, loginValidation, runValidation } = require('../middlewares/validators');

// Apply rate limiter and validators to auth endpoints
router.post("/register", authLimiter, registerValidation, runValidation, userController.register);
router.post("/login", authLimiter, loginValidation, runValidation, userController.login);
router.get("/logout", userController.logout);
router.get("/profile", authMiddleware ,userController.profile);
router.get("/check-auth", authMiddleware, userController.checkAuth);
router.get("/history", authMiddleware, userController.getUserHistory);


module.exports = router;