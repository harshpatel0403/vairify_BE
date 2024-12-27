import mongoose from "mongoose";

const socialAppSchema = new mongoose.Schema(
	{
		socialAppName: {
			type: String,
			required: true,
		},
		socialUrl: {
			type: String,
			required: true,
		},
	},
	{
		timestamps: true,
	},
);

const userSocailSchema = new mongoose.Schema({
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	socialApp: [socialAppSchema],
});

const UserSocial = mongoose.model("UserSocial", userSocailSchema);

export default UserSocial;
