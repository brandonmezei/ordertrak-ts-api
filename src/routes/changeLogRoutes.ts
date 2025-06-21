import { Router } from 'express';
import { createChangeLog } from '../controllers/ChangeLog';
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

// POST /api/changelog
router.post('/create', authenticate, createChangeLog);

export default router;
