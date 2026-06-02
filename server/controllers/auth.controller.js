import bcrypt from "bcryptjs";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import generateToken from "../utils/generateToken.js";

/**
 * Register a new user
 * POST /api/auth/register
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new ApiError(400, "User with this email already exists.");
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || "jobseeker"
    });

    // Remove password from response
    const createdUser = await User.findById(user._id).select("-password");

    // Generate token and set cookie
    const token = generateToken(res, user._id);

    return res
      .status(201)
      .json(new ApiResponse(201, { user: createdUser, token }, "Registration successful. Welcome to HirePK!"));
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new ApiError(400, "Invalid email or password credentials.");
    }

    // OAuth users might not have a password
    if (!user.password) {
      throw new ApiError(400, "This account was registered using Google OAuth. Please sign in with Google.");
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new ApiError(400, "Invalid email or password credentials.");
    }

    // Omit password from response
    const loggedUser = await User.findById(user._id).select("-password");

    // Generate token and set cookie
    const token = generateToken(res, user._id);

    return res
      .status(200)
      .json(new ApiResponse(200, { user: loggedUser, token }, "Login successful. Welcome back!"));
  } catch (error) {
    next(error);
  }
};

/**
 * Get current authenticated user profile
 * GET /api/auth/me
 */
export const getMe = async (req, res, next) => {
  try {
    return res
      .status(200)
      .json(new ApiResponse(200, req.user, "Current user profile fetched successfully."));
  } catch (error) {
    next(error);
  }
};

/**
 * Logout user & clear cookie session
 * POST /api/auth/logout
 */
export const logout = async (req, res, next) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax"
    });

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Logged out successfully. See you soon!"));
  } catch (error) {
    next(error);
  }
};

/**
 * Complete Google OAuth Callback & Redirect to Client
 * GET /api/auth/google/success
 */
export const googleSuccess = async (req, res, next) => {
  try {
    if (!req.user) {
      throw new ApiError(401, "Google Authentication failed.");
    }

    // Generate token and set cookie
    const token = generateToken(res, req.user._id);

    // Redirect user back to the frontend with the token in URL
    // (Zustand store can grab it, store it, and strip it from the URL)
    const frontendRedirectUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/oauth-callback?token=${token}`;
    
    return res.redirect(frontendRedirectUrl);
  } catch (error) {
    next(error);
  }
};
