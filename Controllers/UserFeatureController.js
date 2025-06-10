import FeatureAccess from '../Models/UserFeaturesModal.js';

export const createOrUpdateFeatureAccess = async (req, res) => {
  try {
    const { userId, featureName, hasAccess } = req.body;

    let featureAccess = await FeatureAccess.findOne({ userId, featureName });

    if (!featureAccess) {
      featureAccess = new FeatureAccess({
        userId,
        featureName,
        hasAccess,
      });
    } else {
      featureAccess.hasAccess = hasAccess;
    }

    await featureAccess.save();

    return res.status(200).json({ message: 'Feature access created/updated successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'An error occurred' });
  }
};

export const updateFeatureAccessByFeatureId = async (req, res) => {
  try {
    const { featureId } = req.params;
    const { hasAccess } = req.body;

    const featureAccess = await FeatureAccess.findOne({ featureName: featureId });

    if (!featureAccess) {
      return res.status(404).json({ error: 'Feature access entry not found' });
    }

    featureAccess.hasAccess = hasAccess;

    await featureAccess.save();

    return res.status(200).json({ message: 'Feature access updated successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'An error occurred' });
  }
};

