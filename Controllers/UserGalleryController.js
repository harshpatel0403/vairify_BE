import moment from "moment";
import UserGallery from "../Models/UserGalleryModal.js";
import User from "../Models/UserModal.js";
import Follower from "../Models/FollowerModal.js";
import { sendNotification } from "../Config/utils.js";
import { uploadToS3 } from "../utils/awsS3Functions.js";
import mongoose from "mongoose";

export const createUserGallery = async (req, res) => {
	try {
		// const { userId } = req.body;
		const file = req.files;
		const userId = req.fields.userId;
		var image = "";
		if (file) {
			const folderName = "usergallery";
			await uploadToS3(folderName, file.buffer, file.filename.filename, file.filename.mimetype)
				.then(url => {
					console.log('File uploaded successfully in Gallery controller:', url);
					image = url;
				})
				.catch(err => console.error('Error uploading file in Gallery controller:', err));
		}

		// Find the user's gallery or create a new one if it doesn't exist
		let userGallery = await UserGallery.findOne({ userId });

		if (!userGallery) {
			userGallery = new UserGallery({ userId, images: [] });
		}

		// Add the uploaded image to the user's gallery
		userGallery.images.push({ image, comments: [] });
		await userGallery.save();

		const followers = await Follower.find({ userId: userId }).populate(
			"userId",
		);
		for (let follower of followers) {
			if (follower.isNotifyWhenNewGallaryImagePost) {
				sendNotification(
					userId,
					follower?.follower_id?.toString(),
					"MARKETPLACE_FEED_POST",
					`Photo Upload`,
					`${follower?.userId?.name} has just uploaded a photo in gallery.`,
					{},
				);
			}
		}

		res.status(201).json(userGallery);
	} catch (error) {
		console.error("An error occurred:", error);
		res.status(500).json({
			error: "An error occurred while uploading the image",
		});
	}
};

export const getUserGallery = async (req, res) => {
	try {
		const userId = req.params.userId;

		const userGallery = await UserGallery.findOne({ userId });

		if (!userGallery) {
			return res.status(404).json({ error: "User gallery not found" });
		}

		res.json(userGallery);
	} catch (error) {
		console.error("An error occurred:", error);
		res.status(500).json({
			error: "An error occurred while fetching user gallery details",
		});
	}
};

export const addComments = async (req, res) => {
	try {
		const { userId, imageId, commentText } = req.body;

		const userGallery = await UserGallery.findOne({ userId });

		if (!userGallery) {
			return res.status(404).json({ error: "User gallery not found" });
		}

		const image = userGallery.images.find(img => img._id.equals(new mongoose.Types.ObjectId(imageId)));

		if (!image) {
			return res.status(404).json({ error: "Image not found" });
		}

		image.comments.push({ userId, commentText });
		await userGallery.save();

		res.status(201).json(userGallery);
	} catch (error) {
		console.error("An error occurred:", error);
		res.status(500).json({
			error: "An error occurred while adding the comment",
		});
	}
};

export const getSpecificImageComments = async (req, res) => {
	try {
		const { userId, imageId } = req.params;

		// Fetch specific user gallery
		const userGallery = await UserGallery.findOne({ userId });

		if (!userGallery) {
			return res.status(404).json({ error: "User gallery not found" });
		}

		// Find the specific image by imageId
		const image = userGallery.images.find(img => img._id.equals(imageId));

		if (!image) {
			return res.status(404).json({ error: "Image not found" });
		}

		// Populate user details for each comment
		await Promise.all(
			image.comments.map(async comment => {
				await User.populate(comment, {
					path: "userId",
					model: User,
					select: "name email image vaiID _id profilePic",
				});
			}),
		);

		// Extract comments for the found image with populated user details
		const comments = image.comments;

		return res.status(200).json({ comments });
	} catch (error) {
		console.error("An error occurred:", error);
		return res
			.status(500)
			.json({ error: "An error occurred while fetching data" });
	}
};
