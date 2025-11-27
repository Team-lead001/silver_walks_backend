import { Router } from 'express';
import { registerElderlyUser } from './auth.controller';
import { authRateLimiter } from '../../middlewares/rateLimit.middleware';

import { validateElderlyRegistration } from './auth.schemaValidator';

const auth = Router();

// Elderly registration route
auth.post('/register-elderly', authRateLimiter, validateElderlyRegistration, registerElderlyUser);

export default auth;