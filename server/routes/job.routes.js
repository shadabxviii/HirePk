import { Router } from "express";
import { body } from "express-validator";
import { 
  createJob, 
  getJobs, 
  getJobById, 
  updateJob, 
  deleteJob, 
  getMyListings, 
  saveOrUnsaveJob,
  getMatchedJobs
} from "../controllers/job.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { validateRequest } from "../middleware/validate.middleware.js";

const router = Router();

// Public routes
router.get("/", getJobs);

// Protected routes — static paths MUST come before /:id
router.get("/matched", protect, authorizeRoles("jobseeker"), getMatchedJobs);
router.get("/my/listings", protect, authorizeRoles("employer"), getMyListings);

// Protected routes (Jobseeker only)
router.post("/:id/save", protect, authorizeRoles("jobseeker"), saveOrUnsaveJob);

// Public dynamic route (after static paths)
router.get("/:id", getJobById);

router.post(
  "/",
  protect,
  authorizeRoles("employer"),
  [
    body("title").notEmpty().withMessage("Job title is required").trim(),
    body("description").notEmpty().withMessage("Job description is required").trim(),
    body("category")
      .isIn(["IT", "Finance", "Marketing", "Design", "HR", "Sales", "Engineering", "Other"])
      .withMessage("Invalid job category selection"),
    body("type")
      .isIn(["full-time", "part-time", "internship", "remote", "contract"])
      .withMessage("Invalid job type selection"),
    body("city").notEmpty().withMessage("City is required").trim(),
    body("area").optional().trim(),
    body("minSalary").optional().isNumeric().withMessage("Minimum salary must be numeric"),
    body("maxSalary").optional().isNumeric().withMessage("Maximum salary must be numeric"),
    body("experienceLevel")
      .isIn(["entry", "mid", "senior"])
      .withMessage("Experience level must be entry, mid, or senior"),
    validateRequest
  ],
  createJob
);

router.put(
  "/:id",
  protect,
  authorizeRoles("employer"),
  [
    body("title").optional().notEmpty().withMessage("Job title cannot be empty").trim(),
    body("description").optional().notEmpty().withMessage("Job description cannot be empty").trim(),
    body("category")
      .optional()
      .isIn(["IT", "Finance", "Marketing", "Design", "HR", "Sales", "Engineering", "Other"])
      .withMessage("Invalid job category selection"),
    body("type")
      .optional()
      .isIn(["full-time", "part-time", "internship", "remote", "contract"])
      .withMessage("Invalid job type selection"),
    body("city").optional().notEmpty().withMessage("City cannot be empty").trim(),
    body("experienceLevel")
      .optional()
      .isIn(["entry", "mid", "senior"])
      .withMessage("Experience level must be entry, mid, or senior"),
    validateRequest
  ],
  updateJob
);

router.delete("/:id", protect, authorizeRoles("employer"), deleteJob);

export default router;
