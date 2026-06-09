import { Router } from "express";
import { 
  getAnalytics, 
  getAllUsers, 
  deleteUser, 
  getAllJobs, 
  updateJobStatus, 
  deleteJob 
} from "../controllers/admin.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = Router();

// Restrict all routes in this file to logged-in Admin users
router.use(protect);
router.use(authorizeRoles("admin"));

router.get("/analytics", getAnalytics);
router.get("/users", getAllUsers);
router.delete("/users/:id", deleteUser);

router.get("/jobs", getAllJobs);
router.patch("/jobs/:id/status", updateJobStatus);
router.delete("/jobs/:id", deleteJob);

export default router;
