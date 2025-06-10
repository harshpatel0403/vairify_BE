import mongoose from "mongoose";
import profileDetails from "../Models/ProfileModal.js";
import User from "../Models/UserModal.js";
import Follower from "../Models/FollowerModal.js";
import Favourite from "../Models/FavouriteModal.js";
import { userProfileDir } from "../Routes/UserRoutes.js";
import { cancelSubscription } from "../Config/utils.js";
import Stripe from "stripe";

const { STRIPE_KEY } = process.env;
const stripe = Stripe(STRIPE_KEY);
export const createProfileDetails = async (req, res) => {
	const data = req.body;
	const userId = data.userId;
	data.isPersonalInfoUpdated = true;

	try {
		// Check if a profile with the same userId exists
		const existingProfile = await profileDetails.findOne({ userId });

		if (existingProfile) {
			// Profile with the same userId exists, update it
			await profileDetails.findOneAndUpdate({ userId }, data);
			if (data?.gender) {
				await User.findByIdAndUpdate(userId, { gender: data.gender });
			}

			res.status(200).json({ message: "Profile updated successfully" });
		} else {
			// Profile with the same userId does not exist, create a new one
			const newProfileDetail = new profileDetails(data);

			await newProfileDetail.save();
			if (data?.gender) {
				await User.findByIdAndUpdate(userId, { gender: data.gender });
			}

			res.status(200).json({
				message: "Profile created successfully",
				ProfileDetail: newProfileDetail,
			});
		}
	} catch (error) {
		res.status(500).json({
			error: "An error occurred while creating user details",
		});
	}
};

export const getProfileDetails = async (req, res) => {
	const { userId } = req.params;

	try {
		const userDetails = await profileDetails.findOne({ userId });

		if (!userDetails) {
			return res.status(404).json({ error: "User details not found" });
		}

		res.status(200).json(userDetails);
	} catch (error) {
		res.status(500).json({
			error: "An error occurred while fetching user details",
		});
	}
};

export const updateProfileDetails = async (req, res) => {
	try {
		const userId = req.params.userId;
		const data = req.body;
		data.isPersonalInfoUpdated = true;


		if (!userId || typeof userId !== "string") {
			return res.status(400).json({ error: "Invalid userId parameter" });
		}

		const existingProfile = await profileDetails.findOne({ userId });

		if (existingProfile) {
			await profileDetails.findOneAndUpdate({ userId }, data);
			if (data?.gender) {
				await User.findByIdAndUpdate(userId, { gender: data.gender });
			}
			if (data?.language) {
				await User.findByIdAndUpdate(userId, { language: data?.language });
			}
			const updatedProfile = await profileDetails.findOne({ userId });

			res.status(200).json({
				message: "Profile updated successfully",
				updatedProfile,
			});
		} else {
			const newProfileDetail = new profileDetails({ userId, ...data });

			await newProfileDetail.save();
			if (data?.gender) {
				await User.findByIdAndUpdate(userId, { gender: data.gender });
			}
			if (data?.language) {
				await User.findByIdAndUpdate(userId, { language: data.language });
			}
			res.status(200).json({
				message: "Profile created successfully",
				ProfileDetail: newProfileDetail,
			});
		}
	} catch (error) {
		console.error(error);
		res.status(500).json({
			error: "An error occurred while updating user details",
		});
	}
};

export const getUserFollowers = async (req, res) => {
	const { userId } = req.params;

	try {
		const userDetails = await User.findById(userId);

		if (!userDetails?._id) {
			return res.status(404).json({ error: "User details not found" });
		}
		const followers = await Follower.aggregate([
			{
				$lookup: {
					from: "users",
					localField: "userId",
					foreignField: "_id",
					as: "userData",
				},
			},
			{
				$unwind: {
					path: "$userData",
					preserveNullAndEmptyArrays: true,
				},
			},
			{
				$lookup: {
					from: "profiles",
					localField: "userId",
					foreignField: "userId",
					as: "userProfileData",
				},
			},
			{
				$unwind: {
					path: "$userProfileData",
					preserveNullAndEmptyArrays: true,
				},
			},
			{ $match: { follower_id: new mongoose.Types.ObjectId(userId) } },
			{
				$project: {
					_id: "$userId",
					vaiID: "$userData.vaiID",
					userType: "$userData.user_type",
					gender: "$userData.gender",
					name: "$userData.name",
					profilePic: "$userData.profilePic",
					age: { $ifNull: ["$userProfileData.age", "Not Specified"] },
					height: {
						$ifNull: ["$userProfileData.height", "Not Specified"],
					},
					weight: {
						$ifNull: ["$userProfileData.weight", "Not Specified"],
					},
					averageRating: { $ifNull: ["$userData.averageRating", 0] },
					createdAt: "$createdAt",
					allowUserToAccessServices:
						"$userData.allowUserToAccessServices",
					allowUserToAccessGallery:
						"$userData.allowUserToAccessGallery",
					allowUserCanRates: "$userData.allowUserCanRates",
				},
			},
		]);

		res.status(200).json(followers);
	} catch (error) {
		res.status(500).json({
			error: "An error occurred while fetching user followers",
		});
	}
};

export const getUserFavourites = async (req, res) => {
	const { userId } = req.params;

	try {
		const userDetails = await User.findById(userId);

		if (!userDetails?._id) {
			return res.status(404).json({ error: "User details not found" });
		}

		const favourites = await Favourite.find({ userId });

		res.status(200).json(favourites);
	} catch (error) {
		res.status(500).json({
			error: "An error occurred while fetching user favourites",
		});
	}
};

// Create a route for adding a user to the follow list
export const addFollower = async (req, res) => {
	try {
		const { userId } = req.params; // The user to follow
		const followerId = req.body.userId; // The current user who is doing the following

		console.log("params");
		console.log(userId, followerId);

		// Check if the user and follower exist
		const userToFollow = await User.findById(userId);
		const follower = await User.findById(followerId);

		if (!userToFollow || !follower) {
			return res.status(404).json({ status: 0, error: "User not found" });
		}

		if (userId == followerId) {
			return res
				.status(404)
				.json({ status: 0, error: "You can't follow yourself" });
		}

		// Check if the follow relationship already exists
		const existingFollow = await Follower.findOne({
			userId,
			follower_id: followerId,
		});

		if (existingFollow) {
			return res.status(400).json({
				status: 0,
				message: "User is already in the follow list",
			});
		}

		// Create a new Follow document to represent the following relationship
		const follow = new Follower({ userId, follower_id: followerId });

		// Save the new follow document
		await follow.save();

		const followers = await Follower.find({ userId });

		return res.json({
			status: 1,
			message: "User added to follow list",
			followers,
		});
	} catch (err) {
		res.status(500).json({ status: 0, error: err.message });
	}
};

export const removeFollower = async (req, res) => {
	try {
		const { userId } = req.params; // The user to follow
		const followerId = req.body.userId; // The current user who is doing the following

		// Check if the user and follower exist
		const userToFollow = await User.findById(userId);
		const follower = await User.findById(followerId);

		if (!userToFollow || !follower) {
			return res.status(404).json({ status: 0, error: "User not found" });
		}

		if (userId == followerId) {
			return res
				.status(404)
				.json({ status: 0, error: "You can't unfollow yourself" });
		}

		// Check if the follow relationship already exists
		const existingFollow = await Follower.findOne({
			userId,
			follower_id: followerId,
		});

		if (!existingFollow?._id) {
			return res
				.status(400)
				.json({ status: 0, message: "User is not in the follow list" });
		}

		await Follower.findOneAndDelete({ userId, follower_id: followerId });

		return res.json({
			status: 1,
			message: "User remove from the follow list",
		});
	} catch (err) {
		res.status(500).json({ status: 0, error: err.message });
	}
};

// Create a route for adding a user to the favourite list
export const addFavourite = async (req, res) => {
	try {
		const { userId } = req.params; // The current user
		const favouriteId = req.body.userId; // The favourite user id

		console.log("userId---", userId);
		console.log("favouriteId---", favouriteId);

		// Check if the user and follower exist
		const user = await User.findById(userId);
		const userToFavourite = await User.findById(favouriteId);

		if (!userToFavourite || !user) {
			return res.status(404).json({ status: 0, error: "User not found" });
		}

		if (userId == favouriteId) {
			return res
				.status(404)
				.json({ status: 0, error: "You can't favourite yourself" });
		}

		// Check if the follow relationship already exists
		const existingFavourite = await Favourite.findOne({
			userId,
			favourite_id: favouriteId,
		});

		if (existingFavourite) {
			return res.status(400).json({
				status: 0,
				message: "User is already in the favourite list",
			});
		}

		// Create a new Follow document to represent the following relationship
		const favouriteObj = new Favourite({
			userId,
			favourite_id: favouriteId,
		});

		// Save the new document
		await favouriteObj.save();

		return res.json({ status: 1, message: "User added to favourite list" });
	} catch (err) {
		res.status(500).json({ status: 0, error: err.message });
	}
};

export const removeFavourite = async (req, res) => {
	try {
		const { userId } = req.params; // The current user
		const favouriteId = req.body.userId; // The favourite user id

		console.log("userId---", userId);
		console.log("favouriteId---", favouriteId);

		// Check if the user and follower exist
		const user = await User.findById(userId);
		const userToFavourite = await User.findById(favouriteId);

		if (!userToFavourite || !user) {
			return res.status(404).json({ status: 0, error: "User not found" });
		}

		if (userId == favouriteId) {
			return res
				.status(404)
				.json({ status: 0, error: "You can't unfavourite yourself" });
		}

		// Check if the follow relationship already exists
		const existingFavourite = await Favourite.findOne({
			userId,
			favourite_id: favouriteId,
		});

		if (!existingFavourite?._id) {
			return res.status(400).json({
				status: 0,
				message: "User is not in the favourite list",
			});
		}

		await Favourite.findOneAndDelete({ userId, favourite_id: favouriteId });

		return res.json({
			status: 1,
			message: "User removed from favourite list",
		});
	} catch (err) {
		res.status(500).json({ status: 0, error: err.message });
	}
};

export const getMyVairify = async (req, res) => {
	try {
		const { userId } = req.params; // The user to follow
		const followerUserData = await Follower.aggregate([
			{
				$lookup: {
					from: "users",
					localField: "follower_id",
					foreignField: "_id",
					as: "userData",
				},
			},
			{
				$unwind: {
					path: "$userData",
					preserveNullAndEmptyArrays: true,
				},
			},
			{ $match: { userId: new mongoose.Types.ObjectId(userId) } },
			{
				$project: {
					_id: "$follower_id",
					vaiID: "$userData.vaiID",
					userType: "$userData.user_type",
					gender: "$userData.gender",
					name: "$userData.name",
					profilePic: "$userData.profilePic",
					averageRating: { $ifNull: ["$userData.averageRating", 0] },
					createdAt: "$createdAt",
				},
			},
		]);
		const followingUserData = await Follower.aggregate([
			{
				$lookup: {
					from: "users",
					localField: "userId",
					foreignField: "_id",
					as: "userData",
				},
			},
			{
				$unwind: {
					path: "$userData",
					preserveNullAndEmptyArrays: true,
				},
			},
			{ $match: { follower_id: new mongoose.Types.ObjectId(userId) } },
			{
				$project: {
					_id: "$userId",
					vaiID: "$userData.vaiID",
					userType: "$userData.user_type",
					gender: "$userData.gender",
					name: "$userData.name",
					profilePic: "$userData.profilePic",
					averageRating: { $ifNull: ["$userData.averageRating", 0] },
					createdAt: "$createdAt",
				},
			},
		]);
		const favouriteData = await Favourite.aggregate([
			{
				$lookup: {
					from: "users",
					localField: "favourite_id",
					foreignField: "_id",
					as: "userData",
				},
			},
			{
				$unwind: {
					path: "$userData",
					preserveNullAndEmptyArrays: true,
				},
			},
			{ $match: { userId: new mongoose.Types.ObjectId(userId) } },
			{
				$project: {
					_id: "$favourite_id",
					vaiID: "$userData.vaiID",
					userType: "$userData.user_type",
					gender: "$userData.gender",
					name: "$userData.name",
					profilePic: "$userData.profilePic",
					averageRating: { $ifNull: ["$userData.averageRating", 0] },
					createdAt: "$createdAt",
				},
			},
		]);
		const data = [
			{ type: "followerUserData", data: followerUserData },
			{ type: "followingUserData", data: followingUserData },
			{ type: "favouriteData", data: favouriteData },
		];
		// Function to filter objects based on _id
		const filterDuplicatesById = arr => {
			const uniqueIds = {}; // Object to store unique _id values
			return arr.filter(obj => {
				if (!uniqueIds[obj._id]) {
					uniqueIds[obj._id] = true; // Mark _id as encountered
					return true; // Keep the object
				}
				return false; // Skip the object as duplicate _id
			});
		};
		return res.json({
			status: 1,
			message: "Data loaded successfully",
			data,
		});
	} catch (err) {
		res.status(500).json({ status: 0, message: err.message });
	}
};

export const getVairifyUserDetails = async (req, res) => {
	try {
		const { userId } = req.params; // The current user id
		const otherUserId = req.body.userId;
		const UserData = await User.aggregate([
			{ $match: { _id: new mongoose.Types.ObjectId(otherUserId) } },
			{
				$project: {
					_id: "$_id",
					vaiID: "$vaiID",
					userType: "$user_type",
					name: "$name",
					profilePic: {
						$concat: ["" + userProfileDir + "", "$profilePic"],
					},
					averageRating: { $ifNull: ["$averageRating", 0] },
				},
			},
		]);
		let data = UserData[0];

		// Check if the follow relationship exists
		const existingFollow = await Follower.findOne({
			userId,
			follower_id: otherUserId,
		});
		if (existingFollow) {
			data = {
				...data,
				isFollow: true,
				isNotifyWhenPost: existingFollow.isNotifyWhenPost,
				isNotifyWhenNewPost: existingFollow.isNotifyWhenNewPost,
				isNotifyWhenNewGallaryImagePost:
					existingFollow.isNotifyWhenNewGallaryImagePost,
			};
		} else {
			data = {
				...data,
				isFollow: false,
				isNotifyWhenPost: false,
				isNotifyWhenNewPost: false,
				isNotifyWhenNewGallaryImagePost: false,
			};
		}
		// Check favorites
		const existingFavourite = await Favourite.findOne({
			userId,
			favourite_id: otherUserId,
		});
		if (existingFavourite) {
			data = {
				...data,
				isFavorites: true,
			};
		} else {
			data = {
				...data,
				isFavorites: false,
			};
		}
		return res.json({
			status: 1,
			message: "Data loaded successfully",
			data: data,
		});
	} catch (err) {
		res.status(500).json({ status: 0, message: err.message });
	}
};

// Create a route for updating a followed user notification permission
export const updateNotify = async (req, res) => {
	try {
		const { userId } = req.params; // The user to follow
		const followerId = req.body.followerId; // The current user who is doing the following

		console.log("params");
		console.log(userId, followerId);

		// Check if the user and follower exist
		const userToFollow = await User.findById(userId);
		const follower = await User.findById(followerId);

		if (!userToFollow || !follower) {
			return res.status(404).json({ status: 0, error: "User not found" });
		}

		// if (userId == followerId) {
		//   return res.status(404).json({ status: 0, error: "You can't follow yourself" });
		// }

		// Check if the follow relationship already exists
		const existingFollow = await Follower.findOne({
			userId,
			follower_id: followerId,
		});

		if (existingFollow) {
			// update the new follow document;
			if (req.body.hasOwnProperty("isNotifyWhenPost")) {
				await Follower.updateOne(
					{ userId, follower_id: followerId },
					{ isNotifyWhenPost: req.body.isNotifyWhenPost },
				);
			}
			if (req.body.hasOwnProperty("isNotifyWhenNewReview")) {
				await Follower.updateOne(
					{ userId, follower_id: followerId },
					{ isNotifyWhenNewReview: req.body.isNotifyWhenNewReview },
				);
			}
			if (req.body.hasOwnProperty("isNotifyWhenNewGallaryImagePost")) {
				await Follower.updateOne(
					{ userId, follower_id: followerId },
					{
						isNotifyWhenNewGallaryImagePost:
							req.body.isNotifyWhenNewGallaryImagePost,
					},
				);
			}

			return res.json({ status: 1, message: "updated successfully" });
		}
		return res.json({
			status: 0,
			message: "User is already in the follow list",
		});
	} catch (err) {
		res.status(500).json({ status: 0, error: err.message });
	}
};

export const getUserNotifyRules = async (req, res) => {
	try {
		const { userId, followerId } = req.params; // The user to follow
		// const followerId = req.body.followerId; // The current user who is doing the following

		console.log("params");
		console.log(userId, followerId);

		// Check if the user and follower exist
		const userToFollow = await User.findById(userId);
		const follower = await User.findById(followerId);

		if (!userToFollow || !follower) {
			return res.status(404).json({ status: 0, error: "User not found" });
		}

		// if (userId == followerId) {
		//   return res.status(404).json({ status: 0, error: "You can't follow yourself" });
		// }

		// Check if the follow relationship already exists
		const existingFollow = await Follower.findOne({
			userId,
			follower_id: followerId,
		});
		if (existingFollow) {
			return res.json(existingFollow);
		}
		return res.json({
			status: 0,
			message: "User is not found in follow list",
		});
	} catch (err) {
		res.status(500).json({ status: 0, error: err.message });
	}
};

export const updateProfilePermission = async (req, res) => {
	try {
		const { userId } = req.params; // The user to follow

		// Check if the user and follower exist
		const userDetails = await User.findById(userId);
		if (!userDetails) {
			return res.status(404).json({ status: 0, error: "User not found" });
		}
		// update the profile permission
		if (req.body.hasOwnProperty("allowUserToAccessServices")) {
			await User.updateOne(
				{ _id: userId },
				{
					allowUserToAccessServices:
						req.body.allowUserToAccessServices,
				},
			);
		}
		if (req.body.hasOwnProperty("allowUserToAccessGallery")) {
			await User.updateOne(
				{ _id: userId },
				{ allowUserToAccessGallery: req.body.allowUserToAccessGallery },
			);
		}
		if (req.body.hasOwnProperty("allowUserCanRates")) {
			await User.updateOne(
				{ _id: userId },
				{ allowUserCanRates: req.body.allowUserCanRates },
			);
		}

		return res.json({
			status: 1,
			message: "profile setting updated successfully",
		});
	} catch (err) {
		res.status(500).json({ status: 0, error: err.message });
	}
};

export const memberShipCancelled = async (req, res) => {
	try {
		const { userId } = req.params;
		const { transactionId } = req.body;

		if (!transactionId) {
			return res.status(400).send("Invalid transactionId!");
		}

		// Check if the user and follower exist
		const userDetails = await User.findById(userId);
		if (!userDetails) {
			return res.status(404).json({ status: 0, error: "User not found" });
		}

		const paymentIntent = await stripe.paymentIntents.retrieve(transactionId);

		if (!paymentIntent || !paymentIntent.invoice) {
			return res.status(404).json({ status: 0, error: "No subscription found for this transactionId" });
		}

		const invoice = await stripe.invoices.retrieve(paymentIntent.invoice);
		const subscriptionId = invoice.subscription;

		if (!subscriptionId) {
			return res.status(404).json({ status: 0, error: "No active subscription found for this transaction" });
		}

		//cancel in stripe
		await cancelSubscription(subscriptionId);

		// update the isMemberShipCancelled
		await User.updateOne({ _id: userId }, { isMemberShipCancelled: true });
		return res.json({
			status: 1,
			message: "Membership cancelled successfully",
		});
	} catch (err) {
		res.status(500).json({ status: 0, error: err.message });
	}
};

export const kycCancelled = async (req, res) => {
	try {
		const { userId } = req.params; // The user to follow
		const { subscriptionId } = req.body;

		if (!subscriptionId) {
			return res.status(400).send("Invalid subscriptionId!");
		}

		// Check if the user and follower exist
		const userDetails = await User.findById(userId);
		if (!userDetails) {
			return res.status(404).json({ status: 0, error: "User not found" });
		}

		await cancelSubscription(subscriptionId);

		// update the isMemberShipCancelled
		await User.updateOne({ _id: userId }, { isKycCancelled: true });
		return res.json({ status: 1, message: "KYC cancelled successfully" });
	} catch (err) {
		res.status(500).json({ status: 0, error: err.message });
	}
};
