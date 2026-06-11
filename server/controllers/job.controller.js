import Job from "../models/Job.js";
import Company from "../models/Company.js";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { normalizeSkills } from "../utils/skillNormalizer.js";
import { findJobsForUser } from "../services/jobMatching.service.js";

const parseSkillsInput = (skillsRequired) => {
  if (Array.isArray(skillsRequired)) return normalizeSkills(skillsRequired);
  if (typeof skillsRequired === "string" && skillsRequired.trim()) {
    return normalizeSkills(skillsRequired.split(","));
  }
  return [];
};

/**
 * Post a new Job/Internship
 * POST /api/jobs
 */
export const createJob = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      type,
      city,
      area,
      minSalary,
      maxSalary,
      skillsRequired,
      experienceLevel,
      deadline
    } = req.body;

    let company = await Company.findOne({ owner: req.user._id });
    if (!company) {
      company = await Company.create({
        name: `${req.user.name}'s Company`,
        owner: req.user._id,
        city: city || "Unknown",
        description: "Default company profile created on job posting."
      });
    }

    const job = await Job.create({
      title,
      description,
      company: company._id,
      postedBy: req.user._id,
      category,
      type,
      location: { city, area },
      salary: {
        min: minSalary,
        max: maxSalary,
        currency: "PKR"
      },
      skillsRequired: parseSkillsInput(skillsRequired),
      experienceLevel,
      deadline
    });

    const populatedJob = await Job.findById(job._id).populate("company");

    return res
      .status(201)
      .json(new ApiResponse(201, populatedJob, "Job posted successfully."));
  } catch (error) {
    next(error);
  }
};

/**
 * Build search query with regex (more reliable than $text for partial matches)
 */
const buildJobSearchQuery = (filters) => {
  const { search, city, category, type, experienceLevel, minSalary, skills } = filters;
  const query = { status: "active" };

  if (search && search.trim()) {
    const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const searchRegex = new RegExp(escaped, "i");
    query.$or = [
      { title: searchRegex },
      { description: searchRegex },
      { skillsRequired: searchRegex },
      { "location.city": searchRegex },
      { "location.area": searchRegex }
    ];
  }

  if (city && city !== "All") {
    query["location.city"] = { $regex: new RegExp(city, "i") };
  }

  if (category && category !== "All") {
    query.category = category;
  }

  if (type && type !== "All") {
    query.type = type;
  }

  if (experienceLevel && experienceLevel !== "All") {
    query.experienceLevel = experienceLevel;
  }

  if (minSalary) {
    query["salary.min"] = { $gte: Number(minSalary) };
  }

  if (skills) {
    const skillList = normalizeSkills(
      Array.isArray(skills) ? skills : skills.split(",")
    );
    if (skillList.length > 0) {
      query.skillsRequired = { $in: skillList };
    }
  }

  return query;
};

/**
 * Get all Jobs with Search, Filters and Pagination
 * GET /api/jobs
 */
export const getJobs = async (req, res, next) => {
  try {
    const {
      search,
      city,
      category,
      type,
      experienceLevel,
      minSalary,
      skills,
      page = 1,
      limit = 10
    } = req.query;

    const query = buildJobSearchQuery({
      search, city, category, type, experienceLevel, minSalary, skills
    });

    const skipIndex = (Number(page) - 1) * Number(limit);
    const totalJobs = await Job.countDocuments(query);

    const jobs = await Job.find(query)
      .populate("company", "name logo city industry size")
      .sort({ createdAt: -1 })
      .skip(skipIndex)
      .limit(Number(limit));

    const totalPages = Math.ceil(totalJobs / Number(limit)) || 1;

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          jobs,
          pagination: {
            totalJobs,
            totalPages,
            currentPage: Number(page),
            limit: Number(limit)
          }
        },
        "Jobs retrieved successfully."
      )
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get jobs matched to the logged-in seeker's skills
 * GET /api/jobs/matched
 */
export const getMatchedJobs = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const userSkills = [
      ...(user?.profile?.skills || []),
      ...(user?.profile?.parsedResume?.skills || []),
    ];

    const { page = 1, limit = 10, city, category } = req.query;

    const result = await findJobsForUser(userSkills, { page, limit, city, category });

    return res.status(200).json(
      new ApiResponse(200, result, "Matched jobs retrieved successfully.")
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single Job by ID
 * GET /api/jobs/:id
 */
export const getJobById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const job = await Job.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate("company", "name logo website size industry city area description verified")
      .populate("postedBy", "name email avatar");

    if (!job) {
      throw new ApiError(404, "Job listing not found.");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, job, "Job details retrieved successfully."));
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing Job
 * PUT /api/jobs/:id
 */
export const updateJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    const job = await Job.findById(id);

    if (!job) {
      throw new ApiError(404, "Job listing not found.");
    }

    if (job.postedBy.toString() !== req.user._id.toString()) {
      throw new ApiError(403, "You do not have permissions to modify this job.");
    }

    const {
      title,
      description,
      category,
      type,
      city,
      area,
      minSalary,
      maxSalary,
      skillsRequired,
      experienceLevel,
      status,
      deadline
    } = req.body;

    const parsedSkills = skillsRequired !== undefined
      ? parseSkillsInput(skillsRequired)
      : job.skillsRequired;

    const updatedJob = await Job.findByIdAndUpdate(
      id,
      {
        title,
        description,
        category,
        type,
        location: { city, area },
        salary: {
          min: minSalary,
          max: maxSalary,
          currency: "PKR"
        },
        skillsRequired: parsedSkills,
        experienceLevel,
        status,
        deadline
      },
      { new: true, runValidators: true }
    ).populate("company");

    return res
      .status(200)
      .json(new ApiResponse(200, updatedJob, "Job updated successfully."));
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a Job listing
 * DELETE /api/jobs/:id
 */
export const deleteJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    const job = await Job.findById(id);

    if (!job) {
      throw new ApiError(404, "Job listing not found.");
    }

    if (job.postedBy.toString() !== req.user._id.toString()) {
      throw new ApiError(403, "You do not have permissions to delete this job.");
    }

    await Job.findByIdAndDelete(id);

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Job deleted successfully."));
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve listings posted by the logged-in Employer
 * GET /api/jobs/my/listings
 */
export const getMyListings = async (req, res, next) => {
  try {
    const jobs = await Job.find({ postedBy: req.user._id })
      .populate("company", "name logo")
      .sort({ createdAt: -1 });

    return res
      .status(200)
      .json(new ApiResponse(200, jobs, "Employer listings retrieved successfully."));
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle bookmark/saving a job
 * POST /api/jobs/:id/save
 */
export const saveOrUnsaveJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    const job = await Job.findById(id);
    if (!job) {
      throw new ApiError(404, "Job listing not found.");
    }

    const user = await User.findById(req.user._id);
    const isAlreadySaved = user.savedJobs.some(
      (savedId) => savedId.toString() === id
    );

    if (isAlreadySaved) {
      user.savedJobs = user.savedJobs.filter(
        (savedId) => savedId.toString() !== id
      );
      await user.save();
      return res
        .status(200)
        .json(new ApiResponse(200, { saved: false }, "Job removed from saved list."));
    }

    user.savedJobs.push(id);
    await user.save();
    return res
      .status(200)
      .json(new ApiResponse(200, { saved: true }, "Job bookmarked successfully."));
  } catch (error) {
    next(error);
  }
};
