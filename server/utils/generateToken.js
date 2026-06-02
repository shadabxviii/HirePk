import jwt from "jsonwebtoken";

/**
 * Generates a JWT token and sets it as an HTTP-only cookie
 * @param {object} res Express response object
 * @param {string} userId User ID to sign in payload
 * @returns {string} The signed token
 */
const generateToken = (res, userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

  // Set secure HTTP-only cookie
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax", // Lax enables cross-origin OAuth flow redirections to send credentials
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return token;
};

export default generateToken;
