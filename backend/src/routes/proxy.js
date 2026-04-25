import { Router } from 'express';
import { executeProxy } from '../controllers/proxyController.js';
import { optionalAuth } from '../middleware/optionalAuth.js';
import { proxyLimiter } from '../middleware/rateLimiter.js';

const router = Router();
router.post('/execute', proxyLimiter, optionalAuth, executeProxy);

export default router;
