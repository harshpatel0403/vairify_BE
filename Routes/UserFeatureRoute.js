import express from 'express';
import {
  createOrUpdateFeatureAccess,
  updateFeatureAccessByFeatureId,
} from '../Controllers/UserFeatureController.js';

const featureRouter = express.Router();

// Create or update feature access for a user
featureRouter.post('/create', createOrUpdateFeatureAccess);

// Update feature access by feature ID
featureRouter.put('/update/:featureId', updateFeatureAccessByFeatureId);

export default featureRouter;
