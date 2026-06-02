import fs from "fs";
import Company from "../models/Company.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import configureCloudinary from "../config/cloudinary.js";

const cloudinary = configureCloudinary();

/**
 * Register/Create a Company profile
 * POST /api/companies
 * Private: Employer only
 */
export const createCompany = async (req, res, next) => {
  try {
    const { name, website, industry, size, city, area, description } = req.body;

    // Check if company already registered by this owner
    const existingCompany = await Company.findOne({ owner: req.user._id });
    if (existingCompany) {
      throw new ApiError(400, "You already have a registered company profile. Use edit to update it.");
    }

    const company = await Company.create({
      name,
      owner: req.user._id,
      website,
      industry,
      size,
      city,
      area,
      description
    });

    return res
      .status(201)
      .json(new ApiResponse(201, company, "Company profile created successfully."));
  } catch (error) {
    next(error);
  }
};

/**
 * Update Company details & optional logo upload
 * PUT /api/companies/my
 * Private: Employer only
 */
export const updateMyCompany = async (req, res, next) => {
  try {
    const { name, website, industry, size, city, area, description } = req.body;
    let company = await Company.findOne({ owner: req.user._id });

    if (!company) {
      // Auto create company if update is called but profile doesn't exist
      company = await Company.create({
        name: name || `${req.user.name}'s Company`,
        owner: req.user._id,
        city: city || "Unknown"
      });
    }

    if (name) company.name = name;
    if (website !== undefined) company.website = website;
    if (industry !== undefined) company.industry = industry;
    if (size !== undefined) company.size = size;
    if (city) company.city = city;
    if (area !== undefined) company.area = area;
    if (description !== undefined) company.description = description;

    // Process logo upload if present
    if (req.file) {
      const localFilePath = req.file.path;
      
      if (cloudinary) {
        try {
          const uploadResult = await cloudinary.uploader.upload(localFilePath, {
            folder: "hirepk/companies",
            resource_type: "image"
          });

          company.logo = uploadResult.secure_url;
          company.logoPublicId = uploadResult.public_id;

          if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
          }
        } catch (err) {
          console.error("Cloudinary Logo Upload Error:", err);
          throw new ApiError(500, "Failed to upload logo image to Cloudinary.");
        }
      } else {
        const host = req.get("host");
        company.logo = `${req.protocol}://${host}/uploads/${req.file.filename}`;
      }
    }

    await company.save();

    return res
      .status(200)
      .json(new ApiResponse(200, company, "Company profile updated successfully."));
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};

/**
 * Get own Company profile details
 * GET /api/companies/my
 * Private: Employer only
 */
export const getMyCompany = async (req, res, next) => {
  try {
    const company = await Company.findOne({ owner: req.user._id });
    if (!company) {
      throw new ApiError(404, "No registered company profile found. Please create one.");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, company, "Company profile retrieved."));
  } catch (error) {
    next(error);
  }
};

/**
 * Get Company details by ID
 * GET /api/companies/:id
 * Public
 */
export const getCompanyById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const company = await Company.findById(id);
    if (!company) {
      throw new ApiError(404, "Company profile not found.");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, company, "Company details retrieved."));
  } catch (error) {
    next(error);
  }
};
