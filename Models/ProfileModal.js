import mongoose from "mongoose";

const profileSchema = new mongoose.Schema({
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	siteId: {
		type: String,
		// require: true,
	},
	isAvailable: {
		type: Boolean,
		default: false,
	},
	sharedLocation: String,
	gender: String,
	orientation: String,
	age: String,
	country: String,
	city: String,
	ethinicity: String,
	nationality: String,
	smoker: String,
	languages: String,
	communication: String,
	socialmedia: String,
	typeofbusiness: String,
	staff: String,
	virtual: String,
	location: String,
	venue: String,
	virtualservices: String,
	build: String,
	height: String,
	eyescolor: String,
	haircolor: String,
	hairlength: String,
	weight: String,
	publichair: String,
	piercings: String,
	breasttype: String,
	breastsize: String,
	breastappearance: String,
	tattoos: String,
	dicksize: String,
	travel: String,
	onlyfans: String,
	virtualservice: String,
	pornstar: String,
	description: String,
	description: {
		type: String,
		text: true, // Enable text indexing on the 'description' field
	},
	address: {
		type: String,
	},
	phone: {
		type: String,
	},
	catagory: {
		type: String,
	},
	type: {
		type: String,
	},
	typespecialty: {
		type: String,
	},
	timestamp: {
		type: Date,
		default: Date.now,
	},
	isPersonalInfoUpdated: {
		type: Boolean,
		default: false,
	},
});

const profileDetails = mongoose.model("profile", profileSchema);

export default profileDetails;
