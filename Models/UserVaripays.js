import mongoose from "mongoose";

const paymentAppSchema = new mongoose.Schema({
  paymentAppName: {
    type: String,
    required: true,
  },
  paymentLink: {
    type: String,
    required: true,
  },
  qrCode: {
    type: String,
  },
  paymentImage: {
    type: String,
  },
},
{
  timestamps: true,
});

const userVaripaySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  paymentApp: [paymentAppSchema],
});

const UserVaripay = mongoose.model("UserVaripay", userVaripaySchema);

export default UserVaripay;
