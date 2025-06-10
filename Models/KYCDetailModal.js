import mongoose from "mongoose";

const kycDetailsSchema = new mongoose.Schema({
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	callbackResponse: {
		type: Object,
		required: false,
	},
	image: {
		type: String,
		default: "",
	},
	timestamp: {
		type: Date,
		default: Date.now,
	},
	documentId: {
		type: String,
		default: "",
	},
	clientId: {
		type: String,
		default: "",
	},
	livePhotoId: {
		type: String,
		default: "",
	},
	type: {
		type: String,
		default: "",
	},
	checkId: {
		type: String,
		default: "",
	},
	documentCheckId: {
		type: String,
		default: "",
	},
	isDocIdGenerated: {
		type: Boolean,
		default: false,
	},
	isFrontPhotoUploaded: {
		type: Boolean,
		default: false,
	},
	isBackPhotoUploaded: {
		type: Boolean,
		default: false,
	},
	isLivePhotoUploaded: {
		type: Boolean,
		default: false,
	},
	isCheckDone: {
		type: Boolean,
		default: false,
	},
	documentCheckResult: {
		type: String,
		default: "",
	},
	identityCheckResult: {
		type: String,
		default: "",
	},
	checkResult: {
		type: String,
		default: "",
	},
	isKycCompleted: {
		type: Boolean,
		default: false,
	},
	frontDocUrl: {
		type: String,
		default: "",
	},
	backDocUrl: {
		type: String,
		default: "",
	},
	livePhotoUrl: {
		type: String,
		default: "",
	},
	livePhotoFile: {
		type: String,
		default: ""
	},
	frontDocId: {
		type: String,
		default: "",
	},
	backDocId: {
		type: String,
		default: "",
	},
});

const KYCDetails = mongoose.model("KYCDetails", kycDetailsSchema);

export default KYCDetails;
