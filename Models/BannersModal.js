import mongoose from "mongoose";

const bannersSchema = new mongoose.Schema({
  bannerImage: {
    type: String,
    required: true,
  },
  bannerName: {
    type: String,
    required: true,
  },
  bannerLink: {
    type: String,
    required: true,
  },
  creatorUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  qrCode: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

const Banners =
  mongoose.models.ReferralTree || mongoose.model("Banners", bannersSchema);

export default Banners;
