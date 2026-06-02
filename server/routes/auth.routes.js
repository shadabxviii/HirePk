import { Router } from "express";
import { body } from "express-validator";
import passport from "passport";
import { register, login, logout, getMe, googleSuccess } from "../controllers/auth.controller.js";
import { validateRequest } from "../middleware/validate.middleware.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

// 1. Classic Registration Route
router.post(
  "/register",
  [
    body("name").notEmpty().withMessage("Name is required").trim(),
    body("email").isEmail().withMessage("Provide a valid email address").normalizeEmail(),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
    body("role")
      .optional()
      .isIn(["jobseeker", "employer"])
      .withMessage("Role must be either jobseeker or employer"),
    validateRequest
  ],
  register
);

// 2. Classic Login Route
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Provide a valid email address").normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required"),
    validateRequest
  ],
  login
);

// 3. User Session Details
router.get("/me", protect, getMe);

// 4. Logout User
router.post("/logout", logout);

// 5. Google OAuth Initiator Route
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"], session: false })
);

// 6. Google OAuth Callback Route
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login", session: false }),
  googleSuccess
);

export default router;
