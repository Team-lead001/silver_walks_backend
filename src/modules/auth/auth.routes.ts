import { Router } from 'express';
import {
    loginElderlyUser,
    registerElderlyUser,
    verifyEmail,
    forgotPassword,
    resetPassword,
    registerNurse
} from './auth.controller';
import {
    authRateLimiter,
    emailVerificationRateLimiter,
    passwordResetRateLimiter
} from '../../middlewares/rateLimit.middleware';

import {
    validateElderlyRegistration,
    validateElderlyLogin,
    validateForgotPassword,
    validateResetPassword,
    validateNurseRegistration
} from './auth.schemaValidator';

const auth = Router();

// Elderly registration route
auth.post('/register-elderly', authRateLimiter, validateElderlyRegistration, registerElderlyUser);
auth.post('/register-nurse', authRateLimiter, validateNurseRegistration, registerNurse);
auth.post('/login-elderly', authRateLimiter, validateElderlyLogin, loginElderlyUser);

// Email Verification
auth.post('/verify-email', emailVerificationRateLimiter, verifyEmail);

// Password Reset
auth.post('/forgot-password', passwordResetRateLimiter, validateForgotPassword, forgotPassword);
auth.post('/reset-password', authRateLimiter, validateResetPassword, resetPassword);

export default auth;