import { Request, Response, NextFunction } from 'express';

/**
 * Response interceptor middleware
 * Automatically formats all JSON responses to match the standard API response structure
 */
export const responseInterceptor = (req: Request, res: Response, next: NextFunction): void => {
  // Store the original json method
  const originalJson = res.json.bind(res);

  // Override res.json to intercept and format responses
  res.json = function (body: any): Response {
    // Check if response is already formatted (has success property)
    if (body && typeof body === 'object' && 'success' in body) {
      return originalJson(body);
    }

    // Auto-format responses that aren't already formatted
    const formattedResponse = {
      success: res.statusCode >= 200 && res.statusCode < 300,
      message: body?.message || (res.statusCode >= 200 && res.statusCode < 300 ? 'Request successful' : 'Request failed'),
      data: body?.data !== undefined ? body.data : (body && !body.message ? body : undefined),
      error: res.statusCode >= 400 ? {
        code: body?.code || body?.error?.code || 'ERROR',
        message: body?.message || body?.error?.message || 'An error occurred',
        details: body?.details || body?.error?.details,
      } : undefined,
      meta: {
        timestamp: new Date().toISOString(),
        ...body?.meta,
      },
    };

    // Remove undefined fields
    if (!formattedResponse.data) delete formattedResponse.data;
    if (!formattedResponse.error) delete formattedResponse.error;

    return originalJson(formattedResponse);
  };

  next();
};
