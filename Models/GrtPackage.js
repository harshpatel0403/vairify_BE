import mongoose from "mongoose";

const grtTokenPackageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    totalTokens: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const GRTTokenPackage = mongoose.model(
  "GRTTokenPackage",
  grtTokenPackageSchema
);

export default GRTTokenPackage;
