import { UserRole } from '../models/User.model';

declare global {
  namespace Express {
    interface User {
      userId: string;
      email: string;
      role: UserRole;
    }
    
    interface Request {
      user?: User;
      requestId?: string;
    }
  }
}

export {};

