import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		planId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Plans",
			required: true,
		},
		transactionId: {
			type: String,
			required: true,
		},
		amount: {
			type: Number,
			required: true,
		},
		currency: {
			type: String,
			required: true,
		},
		type: {
			type: String, // membership, kyc, token,
			required: true,
		},
		status: { // paid, unpaid, failed
			type: String,
			required: true,
			default: "unpaid"
		},
	},
	{
		timestamps: true,
	},
);

const Transaction =
	mongoose.models.ReferralTree ||
	mongoose.model("Transaction", transactionSchema);

export default Transaction;
