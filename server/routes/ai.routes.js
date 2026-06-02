import { Router } from "express";
import { 
  reviewResume, 
  generateCoverLetter, 
  analyzeJobMatch, 
  generateInterviewPrep, 
  writeJobDescription, 
  analyzeSkillsGap 
} from "../controllers/ai.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = Router();

// Protect all AI features to prevent public API spam
router.use(protect);

router.post("/review-resume", reviewResume);
router.post("/cover-letter", generateCoverLetter);
router.post("/match-score", analyzeJobMatch);
router.post("/interview-prep", generateInterviewPrep);
router.post("/skills-gap", analyzeSkillsGap);

// Employer-only AI utility
router.post("/write-jd", authorizeRoles("employer"), writeJobDescription);

export default router;
