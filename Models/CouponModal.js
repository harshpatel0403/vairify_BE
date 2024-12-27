import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  usedBy: {
    type: String,
  },
},
{
  timestamps: true,
});

const Coupon = mongoose.model('Coupon', couponSchema);

export default Coupon;
