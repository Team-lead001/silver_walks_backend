import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes';

const router = Router();

// Health check route (already handled in app.ts, but keeping for consistency)
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is healthy',
  });
});



router.use('/auth', authRoutes);

export default router;

