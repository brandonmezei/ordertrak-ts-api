import { Router } from 'express';
import { registerUser, loginUser } from '../controllers/UserController';

const router = Router();

// POST /api/users
router.post('/register', registerUser);
router.post('/login', loginUser);

export default router;
