import { Router } from 'express';
import * as nursesController from './nurses.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { requireNurse } from '../../middlewares/rbac.middleware';
import {
    validateUpdateProfile,
    validateUpdateAvailability,
    validateAddCertification
} from './nurses.schemaValidator';

const nurses = Router();

// Routes require authentication
nurses.use(authenticate);

// GET /api/v1/nurses - Get available nurses
nurses.get('/', nursesController.getNurses);

// Nurse management routes
nurses.get('/me', requireNurse, nursesController.getMe);
nurses.patch('/profile', requireNurse, validateUpdateProfile, nursesController.updateProfile);
nurses.put('/availability', requireNurse, validateUpdateAvailability, nursesController.updateAvailability);
nurses.post('/certifications', requireNurse, validateAddCertification, nursesController.addCertification);
nurses.delete('/certifications/:id', requireNurse, nursesController.removeCertification);

export default nurses;
