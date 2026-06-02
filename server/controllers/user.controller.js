import fs from "fs";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import configureCloudinary from "../config/cloudinary.js";

// Initialize Cloudinary configuration
const cloudinary = configureCloudinary();

/**
 * Get current user profile details
 * GET /api/users/profile
 * Private
 */
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    return res
      .status(200)
      .json(new ApiResponse(200, user, "User profile fetched successfully."));
  } catch (error) {
    next(error);
  }
};

/**
 * Update current user profile details
 * PUT /api/users/profile
 * Private
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { 
      name, 
      avatar, 
      headline, 
      bio, 
      skills, 
      city, 
      area, 
      phone, 
      linkedin, 
      github, 
      portfolio 
    } = req.body;

    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (avatar) user.avatar = avatar;

    // Build the profile subdocument
    if (!user.profile) user.profile = {};

    if (headline !== undefined) user.profile.headline = headline;
    if (bio !== undefined) user.profile.bio = bio;
    if (city !== undefined) user.profile.city = city;
    if (area !== undefined) user.profile.area = area;
    if (phone !== undefined) user.profile.phone = phone;

    if (skills !== undefined) {
      user.profile.skills = Array.isArray(skills) 
        ? skills 
        : skills ? skills.split(",").map(s => s.trim()) : [];
    }

    if (!user.profile.socials) user.profile.socials = {};
    if (linkedin !== undefined) user.profile.socials.linkedin = linkedin;
    if (github !== undefined) user.profile.socials.github = github;
    if (portfolio !== undefined) user.profile.socials.portfolio = portfolio;

    await user.save();

    const updatedUser = await User.findById(req.user._id).select("-password");

    return res
      .status(200)
      .json(new ApiResponse(200, updatedUser, "User profile updated successfully."));
  } catch (error) {
    next(error);
  }
};

/**
 * Get all bookmarked jobs
 * GET /api/users/saved-jobs
 * Private: Seeker only
 */
export const getSavedJobs = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: "savedJobs",
      populate: { path: "company", select: "name logo city" }
    });

    return res
      .status(200)
      .json(new ApiResponse(200, user.savedJobs, "Bookmarked jobs retrieved successfully."));
  } catch (error) {
    next(error);
  }
};

/**
 * Upload PDF Resume
 * POST /api/users/upload-resume
 * Private: Seeker only
 */
export const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new ApiError(400, "Please upload a valid file.");
    }

    const localFilePath = req.file.path;
    const user = await User.findById(req.user._id);
    if (!user.profile) user.profile = {};

    let fileUrl = "";
    let publicId = "";

    if (cloudinary) {
      try {
        // Upload to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(localFilePath, {
          folder: "hirepk/resumes",
          resource_type: "auto"
        });
        
        fileUrl = uploadResult.secure_url;
        publicId = uploadResult.public_id;

        // Clean up local temp file
        if (fs.existsSync(localFilePath)) {
          fs.unlinkSync(localFilePath);
        }

        // Delete old resume from Cloudinary if existed
        if (user.profile.resumePublicId) {
          await cloudinary.uploader.destroy(user.profile.resumePublicId);
        }
      } catch (err) {
        console.error("Cloudinary Upload Error:", err);
        throw new ApiError(500, "Failed to upload resume to Cloudinary. Please try again.");
      }
    } else {
      // Local fallback url (serve locally)
      const host = req.get("host");
      fileUrl = `${req.protocol}://${host}/uploads/${req.file.filename}`;
      
      // Clean up previous local file if exists
      if (user.profile.resumeUrl && user.profile.resumeUrl.includes("/uploads/")) {
        const oldFileName = user.profile.resumeUrl.split("/uploads/")[1];
        const oldFilePath = `./uploads/${oldFileName}`;
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
    }

    // Save details to user record
    user.profile.resumeUrl = fileUrl;
    if (publicId) user.profile.resumePublicId = publicId;
    await user.save();

    return res
      .status(200)
      .json(new ApiResponse(200, { resumeUrl: fileUrl }, "Resume uploaded successfully."));
  } catch (error) {
    // Make sure to clean up local files on errors
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};

/**
 * Upload Audio Pitch (1-Minute Pitch)
 * POST /api/users/upload-pitch
 * Private: Seeker only
 */
export const uploadAudioPitch = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new ApiError(400, "Please upload a valid audio file.");
    }

    const localFilePath = req.file.path;
    const user = await User.findById(req.user._id);
    if (!user.profile) user.profile = {};

    let audioUrl = "";

    if (cloudinary) {
      try {
        const uploadResult = await cloudinary.uploader.upload(localFilePath, {
          folder: "hirepk/pitches",
          resource_type: "video" // Audio is classified as video category under Cloudinary API
        });
        
        audioUrl = uploadResult.secure_url;

        if (fs.existsSync(localFilePath)) {
          fs.unlinkSync(localFilePath);
        }
      } catch (err) {
        console.error("Cloudinary Audio Upload Error:", err);
        throw new ApiError(500, "Failed to upload audio to Cloudinary.");
      }
    } else {
      const host = req.get("host");
      audioUrl = `${req.protocol}://${host}/uploads/${req.file.filename}`;
    }

    user.profile.audioPitchUrl = audioUrl;
    await user.save();

    return res
      .status(200)
      .json(new ApiResponse(200, { audioPitchUrl: audioUrl }, "Audio pitch uploaded successfully."));
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};

