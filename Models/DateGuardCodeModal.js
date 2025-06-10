import mongoose from "mongoose";

const dateGuardCodesSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  disarm: {
    type: String,
    required: true,
  },
  decoy: {
    type: String,
    required: true,
  },
},
{
  timestamps: true,
});

const DateGuardCodes = mongoose.model("DateGuardCodes", dateGuardCodesSchema);

export default DateGuardCodes;
