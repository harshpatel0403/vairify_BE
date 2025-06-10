import mongoose from "mongoose";

const userVaripayRequestSchema = new mongoose.Schema({
  requester: {
    type: mongoose.Schema.Types.ObjectId, // Store the ObjectId of the requesting user
    ref: "User", // Reference to the User model
  },
  targetUser: {
    type: mongoose.Schema.Types.ObjectId, // Store the ObjectId of the target user
    ref: "User", // Reference to the User model
  },
  amount: {
    type: String,
  },
  comment: {
    type: String,
  },
  slug:{
    type: String,
  },
},
{
  timestamps: true,
});

const UserVaripayRequest = mongoose.model(
  "UserVaripayRequests",
  userVaripayRequestSchema
);

export default UserVaripayRequest;
