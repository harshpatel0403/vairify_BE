import mongoose from "mongoose";

const followerSchema  = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  follower_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  isNotifyWhenPost: {
    type: Boolean,
    default: true,
  },
  isNotifyWhenNewReview: {
    type: Boolean,
    default: true,
  },
  isNotifyWhenNewGallaryImagePost: {
    type: Boolean,
    default: true,
  },
},
{
  timestamps: true,
});

const Follower  = mongoose.models.Follower  || mongoose.model("follower", followerSchema );

export default Follower;
