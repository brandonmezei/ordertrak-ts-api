import { Router } from 'express';
import { createChangeLog, getChangeLogs } from '../controllers/ChangeLog';
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

// POST /api/changelog
router.post('/', authenticate, createChangeLog);
router.get('/', authenticate, getChangeLogs);

export default router;
