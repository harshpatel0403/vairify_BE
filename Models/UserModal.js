import mongoose from "mongoose";
import shortid from "shortid";
import moment from "moment";

const generateVaiID = () => {
	const id = shortid.generate().slice(0, 7).toUpperCase();
	return id;
};

const userSchema = new mongoose.Schema(
	{
		id: {
			type: Number,
		},
		complyUserId: {
			type: String,
			default: "",
		},
		parentId: {
			type: String,
			default: "",
		},
		parent_affiliate: {
			type: String,
			default: "",
		},
		name: {
			type: String,
		},
		email: {
			type: String,
			required: true,
			unique: true,
		},
		password: {
			type: String,
			required: true,
		},
		image: {
			type: String,
		},
		epassword: {
			type: String,
			default: "",
		},
		couponUsed: {
			type: String,
			default: "",
		},
		country: {
			type: String,
			default: "",
		},
		affiliate_url: {
			type: String,
			default: "",
		},
		referralCode: {
			type: String,
			default: shortid.generate,
		},
		// referralLink: {
		//   type: String,
		// },
		walletBalance: {
			type: Number,
			default: 0,
		},
		tokens: {
			type: Number,
			default: 0,
		},
		revenue: {
			type: String,
			default: "",
		},
		phone: {
			type: String,
			default: "",
		},
		whatsapp: {
			type: Number,
		},
		address: {
			type: String,
		},
		user_type: {
			type: String,
			default: "",
		},
		business_name: {
			type: String,
			default: "",
		},
		business_type: {
			type: String,
			default: "",
		},
		gender: {
			type: String,
			default: "",
		},
		averageRating: {
			type: Number,
			default: 0,
		},
		is_verified: {
			type: Boolean,
			default: false,
		},
		verificationDate: Date,
		is_active: {
			type: Boolean,
			default: false,
		},
		is_beta_tester: {
			type: Boolean,
			default: false,
		},
		is_app_notified: {
			type: Boolean,
			default: false,
		},
		language: {
			type: String,
			default: "",
		},
		is_mutal_contract: {
			type: Boolean,
			default: false,
		},
		is_email_verified: {
			type: Boolean,
			default: false,
		},
		is_phone_verified: {
			type: Boolean,
			default: false,
		},
		parent: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			default: null,
		},
		staff_parent: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			default: null,
		},
		bussiness_vai: {
			type: String, //this is for the person who is working for the bussiness
			default: "",
		},
		vaiID: {
			type: String,
			default: generateVaiID,
			unique: true,
		},
		is_admin: {
			type: Boolean,
			default: false,
		},
		is_superadmin: {
			type: Boolean,
			default: false,
		},
		application_type: {
			type: String,
		},
		profilePic: {
			type: String,
			default: "",
		},
		faceVerificationImage:{
			type: String,
			default: "",	
		},
		tokensActivity: {
			type: Boolean,
			default: true,
		},
		dateGuardActivity: {
			type: Boolean,
			default: true,
		},
		marketPlaceActivity: {
			type: Boolean,
			default: true,
		},
		calendarActivity: {
			type: Boolean,
			default: true,
		},
		varipayActivity: {
			type: Boolean,
			default: true,
		},
		inAppFacialVerificationActivity: {
			type: Boolean,
			default: true,
		},
		advertisementActivity: {
			type: Boolean,
			default: true,
		},
		callsActivity: {
			type: Boolean,
			default: true,
		},
		messagesActivity: {
			type: Boolean,
			default: true,
		},
		socialPostActivity: {
			type: Boolean,
			default: true,
		},
		interests: [String],
		resetCode: {
			type: String,
			default: "",
		},
		verifyOtp: {
			type: String,
			default: "",
		},
		savedLocations: [
			{
				country: String,
				city: String,
			},
		],
		isTest: {
			type: Boolean,
			default: false,
		},
		incallAddresses: [
			{
				lat: String,
				lng: String,
				address: String,
				addressLine1: String,
				landmark: String,
			},
		],
		vaiNowAvailable: {
			availableFrom: Date,
			duration: Number, // Duration in minutes
			venue: [String],
			isPrivate: Boolean,
		},
		allowUserToAccessServices: {
			type: Boolean,
			default: true,
		},
		allowUserToAccessGallery: {
			type: Boolean,
			default: true,
		},
		allowUserCanRates: {
			type: Boolean,
			default: true,
		},
		mutualContractSigned: Boolean,
		locationRequests: [
			{
				userId: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "User",
					default: null,
				},
				requestedAt: Date,
				isApproved: Boolean,
				approvedAt: Date,
				isRejected: Boolean,
				rejectedAt: Date,
			},
		],
		subscription: [
			{
				planId: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "Plans",
					required: false,
				},
				transactionId: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "Transaction",
					required: false,
				},
				subscriptionId: String,
				amount: Number,
				currency: String,
				days: Number,
				expiryDate: Date,
				startDate: {
					type: Date,
					default: null,
				},
				purchaseDate: Date,
			},
		],
		kyc: [
			{
				planId: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "Plans",
					required: false,
				},
				transactionId: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "Transaction",
					required: false,
				},
				subscriptionId: String,
				amount: Number,
				currency: String,
				days: Number,
				expiryDate: Date,
				startDate: {
					type: Date,
					default: null,
				},
				purchaseDate: Date,
			},
		],
		migration: {
			planId: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "Plans",
				required: false,
			},
			transactionId: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "Transaction",
				required: false,
			},
			migrationId: String,
			amount: Number,
			currency: String,
			startDate: {
				type: Date,
				default: null,
			},
			purchaseDate: Date,
		},
		customerId: {
			type: String,
		},
		isMemberShipCancelled: {
			type: Boolean,
			default: false,
		},
		isKycCancelled: {
			type: Boolean,
			default: false,
		},
		isKycCompleted: {
			type: Boolean,
			default: false,
		},
		isBetaTester: {
			type: Boolean,
			default: true,
		},
		notifyOnRelease: {
			type: Boolean,
			default: true,
		},
		checkCount:{
			type: Number,
			default: 0
		},
		isKycFailed:{
			type: Boolean,
			default: false,
		},
		notificationTokens: Array,
		pushNotification: { type: Boolean, default: true },
	},
	{
		timestamps: true,
	},
);

// Middleware to update is_verified field
userSchema.pre("findOne", function (next) {
	const currentDate = moment();
	if (this.is_verified && currentDate >= moment(this.verificationDate)) {
		this.is_verified = false;
		this.verificationDate = "";
		this.save().then(() => next());
	} else {
		next();
	}
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
