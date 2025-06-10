import mongoose from 'mongoose';

const featureAccessSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true,
  },
  featureName: {
    type: String,
    required: true,
  },
  hasAccess: {
    type: Boolean,
    required: true,
  },
},
{
  timestamps: true,
});

const FeatureAccess = mongoose.model('UserFeatures', featureAccessSchema);

export default FeatureAccess;
