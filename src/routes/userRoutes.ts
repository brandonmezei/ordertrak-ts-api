import { Router } from 'express';
import { registerUser, loginUser, getUserProfile } from '../controllers/UserController';
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

// POST /api/users
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/', authenticate, getUserProfile);

export default router;
