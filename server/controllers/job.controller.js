import Job from "../models/Job.js";
import Company from "../models/Company.js";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

/**
 * Post a new Job/Internship
 * POST /api/jobs
 * Private: Employer only
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

    // Check if employer has a registered company.
    // If not, auto-create a default company profile to prevent user blockages.
    let company = await Company.findOne({ owner: req.user._id });
    if (!company) {
      company = await Company.create({
        name: `${req.user.name}'s Company`,
        owner: req.user._id,
        city: city || "Unknown",
        description: "Default company profile created on job posting."
      });
    }

    const parsedSkills = Array.isArray(skillsRequired) 
      ? skillsRequired 
      : skillsRequired ? skillsRequired.split(",").map(s => s.trim()) : [];

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
      skillsRequired: parsedSkills,
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
 * Get all Jobs with Search, Filters and Pagination
 * GET /api/jobs
 * Public
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
      page = 1,
      limit = 10 
    } = req.query;

    const query = { status: "active" };

    // 1. Full-text search
    if (search) {
      query.$text = { $search: search };
    }

    // 2. City filter
    if (city) {
      query["location.city"] = { $regex: new RegExp(city, "i") };
    }

    // 3. Category filter
    if (category && category !== "All") {
      query.category = category;
    }

    // 4. Job Type filter (e.g. full-time, remote)
    if (type && type !== "All") {
      query.type = type;
    }

    // 5. Experience Level filter
    if (experienceLevel && experienceLevel !== "All") {
      query.experienceLevel = experienceLevel;
    }

    // 6. Minimum Salary filter
    if (minSalary) {
      query["salary.min"] = { $gte: Number(minSalary) };
    }

    const skipIndex = (Number(page) - 1) * Number(limit);

    // Get matching jobs count
    const totalJobs = await Job.countDocuments(query);

    // Fetch jobs
    const jobs = await Job.find(query)
      .populate("company", "name logo city industry size")
      .sort({ createdAt: -1 })
      .skip(skipIndex)
      .limit(Number(limit));

    const totalPages = Math.ceil(totalJobs / Number(limit));

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
 * Get a single Job by ID & increment views count
 * GET /api/jobs/:id
 * Public
 */
export const getJobById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Retrieve job and increment views in single call
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
 * Private: Employer only (Owner of the job listing)
 */
export const updateJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    const job = await Job.findById(id);

    if (!job) {
      throw new ApiError(404, "Job listing not found.");
    }

    // Check ownership
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

    const parsedSkills = Array.isArray(skillsRequired) 
      ? skillsRequired 
      : skillsRequired ? skillsRequired.split(",").map(s => s.trim()) : job.skillsRequired;

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
 * Private: Employer only (Owner of the job listing)
 */
export const deleteJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    const job = await Job.findById(id);

    if (!job) {
      throw new ApiError(404, "Job listing not found.");
    }

    // Check ownership
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
 * Private: Employer only
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
 * Private: Job Seeker only
 */
export const saveOrUnsaveJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    const job = await Job.findById(id);
    if (!job) {
      throw new ApiError(404, "Job listing not found.");
    }

    const user = await User.findById(req.user._id);
    const isAlreadySaved = user.savedJobs.includes(id);

    if (isAlreadySaved) {
      // Remove job from list
      user.savedJobs = user.savedJobs.filter(savedId => savedId.toString() !== id);
      await user.save();
      return res
        .status(200)
        .json(new ApiResponse(200, { saved: false }, "Job removed from saved list."));
    } else {
      // Add job to list
      user.savedJobs.push(id);
      await user.save();
      return res
        .status(200)
        .json(new ApiResponse(200, { saved: true }, "Job bookmarked successfully."));
    }
  } catch (error) {
    next(error);
  }
};
