import { Router } from "express";
import { 
  getProfile, 
  updateProfile, 
  getSavedJobs, 
  uploadResume, 
  uploadAudioPitch 
} from "../controllers/user.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { upload } from "../middleware/upload.middleware.js";

const router = Router();

// Protect all routes
router.use(protect);

router.get("/profile", getProfile);
router.put("/profile", updateProfile);

// Jobseeker-only routes
router.get("/saved-jobs", authorizeRoles("jobseeker"), getSavedJobs);
router.post("/upload-resume", authorizeRoles("jobseeker"), upload.single("resume"), uploadResume);
router.post("/upload-pitch", authorizeRoles("jobseeker"), upload.single("pitch"), uploadAudioPitch);

export default router;
