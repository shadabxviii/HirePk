import { Router } from "express";
import { body } from "express-validator";
import { 
  createCompany, 
  updateMyCompany, 
  getMyCompany, 
  getCompanyById 
} from "../controllers/company.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { upload } from "../middleware/upload.middleware.js";
import { validateRequest } from "../middleware/validate.middleware.js";

const router = Router();

// Public routes
router.get("/:id", getCompanyById);

// Protected routes (Employer only)
router.post(
  "/",
  protect,
  authorizeRoles("employer"),
  [
    body("name").notEmpty().withMessage("Company name is required").trim(),
    body("city").notEmpty().withMessage("City is required").trim(),
    body("size")
      .optional()
      .isIn(["1-10", "11-50", "51-200", "201-500", "500+"])
      .withMessage("Invalid company size value"),
    validateRequest
  ],
  createCompany
);

router.put(
  "/my",
  protect,
  authorizeRoles("employer"),
  upload.single("logo"),
  [
    body("name").optional().notEmpty().withMessage("Company name cannot be empty").trim(),
    body("city").optional().notEmpty().withMessage("City cannot be empty").trim(),
    body("size")
      .optional()
      .isIn(["1-10", "11-50", "51-200", "201-500", "500+"])
      .withMessage("Invalid company size value"),
    validateRequest
  ],
  updateMyCompany
);

router.get("/my", protect, authorizeRoles("employer"), getMyCompany);

export default router;
