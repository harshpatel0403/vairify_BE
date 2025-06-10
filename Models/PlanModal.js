import mongoose from "mongoose";

const plansSchema = new mongoose.Schema(
	{
		amount: {
			type: Number,
			required: true,
		},
		finalAmount: {
			type: Number,
			required: true,
		},
		discountAmount: {
			type: Number,
			required: true,
		},
		title: {
			type: String,
			required: true,
		},
		currency: {
			type: String,
			required: true,
		},
		userType: {
			type: [String],
			required: true,
		},
		type: {
			type: String, // kyc, membership, migration
			required: true,
		},
		days: {
			type: Number,
			required: true,
		},
		isActive: {
			type: Boolean,
			default: true,
		},
		deleted: {
			type: Boolean,
			default: false,
		},
		slug: {
			type: String,
			default: '',
		},
		priceId: {
			type: String
		},
		isEnabled: {
			type: Boolean,
			default: true,
		}
	},
	{
		timestamps: true,
	},
);

const Plans =
	mongoose.models.ReferralTree || mongoose.model("Plans", plansSchema);

export default Plans;
