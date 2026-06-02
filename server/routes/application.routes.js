import { Router } from "express";
import { body } from "express-validator";
import { 
  applyToJob, 
  getMyApplications, 
  getApplicantsForJob, 
  updateApplicationStatus 
} from "../controllers/application.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { validateRequest } from "../middleware/validate.middleware.js";

const router = Router();

// Protect all routes in this router
router.use(protect);

// Seeker-only routes
router.post(
  "/",
  authorizeRoles("jobseeker"),
  [
    body("jobId").notEmpty().withMessage("Job ID is required").isMongoId().withMessage("Invalid Job ID format"),
    body("coverLetter").optional().trim(),
    body("resumeUrl").optional().isURL().withMessage("Resume URL must be a valid URL"),
    body("audioPitchUrl").optional().isURL().withMessage("Audio pitch URL must be a valid URL"),
    validateRequest
  ],
  applyToJob
);

router.get("/my", authorizeRoles("jobseeker"), getMyApplications);

// Employer-only routes
router.get("/job/:jobId", authorizeRoles("employer"), getApplicantsForJob);

router.patch(
  "/:id/status",
  authorizeRoles("employer"),
  [
    body("status")
      .isIn(["pending", "viewed", "shortlisted", "interviewing", "rejected", "hired"])
      .withMessage("Invalid status update value"),
    validateRequest
  ],
  updateApplicationStatus
);

export default router;
