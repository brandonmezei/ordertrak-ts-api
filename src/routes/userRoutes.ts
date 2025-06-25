import { Router } from "express";
import {
  registerUser,
  loginUser,
  getUserProfile,
  logoutUser,
  updateUserProfile,
  changeUserPassword
} from "../controllers/UserController";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

// POST /api/users
router.post("/register", registerUser);
router.post("/login", loginUser);

router.get("/", authenticate, getUserProfile);
router.post("/", authenticate, updateUserProfile);
router.post("/change-password", authenticate, changeUserPassword);

router.post("/logout", authenticate, logoutUser);

// Validation
router.get("/validate", authenticate, (req, res) => {
  res.status(200).json({ valid: true });
});

export default router;
