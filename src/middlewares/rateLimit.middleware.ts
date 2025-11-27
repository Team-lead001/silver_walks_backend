import { Request, Response } from 'express';
import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit';

import { config } from '../config/env.config';
import { ErrorCode } from '../utils/error.util';

/**
 * Generate rate limiter instance
 * PER ENDPOINT – NO IP USED
 */
const createRateLimiter = (
  windowMs: number,
  maxRequests: number,
  message?: string
): RateLimitRequestHandler => {
  return rateLimit({
    windowMs,
    max: maxRequests,
    message: message || {
      success: false,
      error: {
        code: ErrorCode.CONFLICT,
        message: 'Too many requests, please try again later.',
      },
    },
    standardHeaders: true,
    legacyHeaders: false,

    handler: (_req: Request, res: Response) => {
      res.status(429).json({
        success: false,
        error: {
          code: ErrorCode.CONFLICT,
          message: message || 'Too many requests, please try again later.',
        },
      });
    },

    /** 👇 KEY: ENDPOINT ONLY (NOT IP) */
    keyGenerator: (req: Request): string => req.originalUrl,
  });
};

/** General API rate limiter */
export const apiRateLimiter = createRateLimiter(
  config.rateLimit.windowMs,
  config.rateLimit.maxRequests,
  'Too many requests to this endpoint, try again later.'
);

/** Strict auth limiter */
export const authRateLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 mins
  5,
  'Too many authentication attempts, please try again later.'
);

/** Password reset limiter */
export const passwordResetRateLimiter = createRateLimiter(
  60 * 60 * 1000, // 1 hour
  3,
  'Too many password reset attempts, please try again later.'
);

/** Email verification limiter */
export const emailVerificationRateLimiter = createRateLimiter(
  15 * 60 * 1000,
  3,
  'Too many email verification attempts, please try again later.'
);

/** File upload limiter */
export const uploadRateLimiter = createRateLimiter(
  60 * 60 * 1000,
  20,
  'Too many file uploads, please try again later.'
);

/** Sensitive operations limiter (payments, withdrawals) */
export const sensitiveOperationRateLimiter = createRateLimiter(
  60 * 60 * 1000,
  10,
  'Too many sensitive actions, please try again later.'
);

/** Custom rate limiter factory */
export const createCustomRateLimiter = createRateLimiter;
