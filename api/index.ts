import { getApp } from '../dist/app';
import type { VercelRequest, VercelResponse } from '@vercel/node';

let app: any = null;

const handler = async (req: VercelRequest, res: VercelResponse) => {
  try {
    if (!app) {
      // Initialize app on cold start
      app = await getApp();
    }

    // Handle the request using Express app
    return app(req, res);
  } catch (error) {
    console.error('Serverless function error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? String(error) : undefined,
    });
  }
};

export default handler;
