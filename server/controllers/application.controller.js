import Application from "../models/Application.js";
import Job from "../models/Job.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

/**
 * Apply to a Job
 * POST /api/applications
 * Private: Job Seeker only
 */
export const applyToJob = async (req, res, next) => {
  try {
    const { jobId, coverLetter, resumeUrl, audioPitchUrl } = req.body;

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      throw new ApiError(404, "Job listing not found.");
    }

    if (job.status !== "active") {
      throw new ApiError(400, "This job listing is no longer active.");
    }

    // Verify user is not applying to their own job
    if (job.postedBy.toString() === req.user._id.toString()) {
      throw new ApiError(400, "Employers cannot apply to their own job listings.");
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      job: jobId,
      applicant: req.user._id
    });

    if (existingApplication) {
      throw new ApiError(400, "You have already applied to this job listing.");
    }

    // Resolve resume URL (use custom provided or default profile resume)
    const finalResumeUrl = resumeUrl || req.user.profile?.resumeUrl;
    if (!finalResumeUrl) {
      throw new ApiError(400, "Please upload a resume or add it to your profile before applying.");
    }

    // Create application
    const application = await Application.create({
      job: jobId,
      applicant: req.user._id,
      coverLetter: coverLetter || "",
      resumeUrl: finalResumeUrl,
      audioPitchUrl: audioPitchUrl || req.user.profile?.audioPitchUrl || ""
    });

    // Increment applicant count on job
    job.applicantsCount += 1;
    await job.save();

    return res
      .status(201)
      .json(new ApiResponse(201, application, "Application submitted successfully."));
  } catch (error) {
    next(error);
  }
};

/**
 * Get own Job applications
 * GET /api/applications/my
 * Private: Job Seeker only
 */
export const getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ applicant: req.user._id })
      .populate({
        path: "job",
        populate: { path: "company", select: "name logo city" }
      })
      .sort({ appliedAt: -1 });

    return res
      .status(200)
      .json(new ApiResponse(200, applications, "My applications fetched successfully."));
  } catch (error) {
    next(error);
  }
};

/**
 * Get applicants list for a specific Job
 * GET /api/applications/job/:jobId
 * Private: Employer only
 */
export const getApplicantsForJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    // Verify job belongs to employer
    const job = await Job.findById(jobId);
    if (!job) {
      throw new ApiError(404, "Job listing not found.");
    }

    if (job.postedBy.toString() !== req.user._id.toString()) {
      throw new ApiError(403, "You do not have permissions to view applicants for this job.");
    }

    const applications = await Application.find({ job: jobId })
      .populate("applicant", "name email avatar profile")
      .sort({ appliedAt: -1 });

    return res
      .status(200)
      .json(new ApiResponse(200, applications, `Applicants for job '${job.title}' retrieved.`));
  } catch (error) {
    next(error);
  }
};

/**
 * Update application recruitment status
 * PATCH /api/applications/:id/status
 * Private: Employer only
 */
export const updateApplicationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatus = ["pending", "viewed", "shortlisted", "interviewing", "rejected", "hired"];
    if (!allowedStatus.includes(status)) {
      throw new ApiError(400, "Invalid application status state provided.");
    }

    const application = await Application.findById(id).populate("job");
    if (!application) {
      throw new ApiError(404, "Application not found.");
    }

    // Verify employer is the owner of the job
    if (application.job.postedBy.toString() !== req.user._id.toString()) {
      throw new ApiError(403, "You are not authorized to update status of this application.");
    }

    application.status = status;
    await application.save();

    return res
      .status(200)
      .json(new ApiResponse(200, application, `Application status updated to '${status}'.`));
  } catch (error) {
    next(error);
  }
};
