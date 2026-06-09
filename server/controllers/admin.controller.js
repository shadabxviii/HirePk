import User from "../models/User.js";
import Job from "../models/Job.js";
import Application from "../models/Application.js";
import Company from "../models/Company.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

/**
 * Get system-wide analytics for admin dashboard
 * GET /api/admin/analytics
 */
export const getAnalytics = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalJobs = await Job.countDocuments();
    const totalApplications = await Application.countDocuments();
    const totalCompanies = await Company.countDocuments();

    // Get breakdown of users by role
    const seekerCount = await User.countDocuments({ role: "jobseeker" });
    const employerCount = await User.countDocuments({ role: "employer" });
    const adminCount = await User.countDocuments({ role: "admin" });

    // Get active vs closed jobs
    const activeJobs = await Job.countDocuments({ status: "active" });
    const closedJobs = await Job.countDocuments({ status: "closed" });

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          totalUsers,
          totalJobs,
          totalApplications,
          totalCompanies,
          roles: { seekerCount, employerCount, adminCount },
          jobs: { activeJobs, closedJobs }
        },
        "Analytics fetched successfully."
      )
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get all users registered in the system
 * GET /api/admin/users
 */
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    return res
      .status(200)
      .json(new ApiResponse(200, users, "All users retrieved successfully."));
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a user and clean up their associated data
 * DELETE /api/admin/users/:id
 */
export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      throw new ApiError(404, "User not found.");
    }

    if (user.role === "admin") {
      throw new ApiError(400, "Cannot delete an admin user.");
    }

    // Clean up if employer
    if (user.role === "employer") {
      // Find all jobs posted by the employer
      const jobs = await Job.find({ postedBy: id });
      const jobIds = jobs.map((job) => job._id);

      // Delete all applications for those jobs
      await Application.deleteMany({ job: { $in: jobIds } });

      // Delete the jobs
      await Job.deleteMany({ postedBy: id });

      // Delete company profile
      await Company.findOneAndDelete({ owner: id });
    }

    // Clean up if jobseeker
    if (user.role === "jobseeker") {
      // Delete applications made by the seeker
      await Application.deleteMany({ applicant: id });
    }

    // Delete the user itself
    await User.findByIdAndDelete(id);

    return res
      .status(200)
      .json(new ApiResponse(200, null, "User and associated data deleted successfully."));
  } catch (error) {
    next(error);
  }
};

/**
 * Get all jobs posted in the system
 * GET /api/admin/jobs
 */
export const getAllJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find()
      .populate("company", "name logo")
      .populate("postedBy", "name email")
      .sort({ createdAt: -1 });

    return res
      .status(200)
      .json(new ApiResponse(200, jobs, "All jobs retrieved successfully."));
  } catch (error) {
    next(error);
  }
};

/**
 * Update status of any job listing
 * PATCH /api/admin/jobs/:id/status
 */
export const updateJobStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["active", "closed", "draft"].includes(status)) {
      throw new ApiError(400, "Invalid status type.");
    }

    const job = await Job.findById(id);
    if (!job) {
      throw new ApiError(404, "Job not found.");
    }

    job.status = status;
    await job.save();

    return res
      .status(200)
      .json(new ApiResponse(200, job, `Job status updated to ${status}.`));
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a job listing
 * DELETE /api/admin/jobs/:id
 */
export const deleteJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    const job = await Job.findById(id);

    if (!job) {
      throw new ApiError(404, "Job not found.");
    }

    // Delete associated applications
    await Application.deleteMany({ job: id });

    // Delete the job listing
    await Job.findByIdAndDelete(id);

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Job and associated applications deleted successfully."));
  } catch (error) {
    next(error);
  }
};
