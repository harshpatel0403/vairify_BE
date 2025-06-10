import MarketPlacePost from "../Models/MarketPlacePostModal.js";
import Services from "../Models/ServicesModal.js";
import profileDetails from "../Models/ProfileModal.js";
import User from "../Models/UserModal.js";
import moment from "moment-timezone";
import cron from "node-cron";
import Follower from "../Models/FollowerModal.js";
import { sendNotification } from "../Config/utils.js";
import { uploadToS3, deleteFilesFromFolder } from "../utils/awsS3Functions.js";
import fs from 'fs';


export const getAllMarketPost = async (req, res) => {
	try {
		const currentDate = moment().startOf("day");

		function parseDate(str) {
			return moment(str, "DD/MM/YYYY", true);
		}
		var featuredPosts = await MarketPlacePost.find({
			// "date.from": { $lte: new Date('DD/MM/YYYY').toString() },
			// "date.to": { $gte: new Date('DD/MM/YYYY').toString() },
			featurelisting: true
		})
			.populate({
				path: "userId",
				select: "userId name profilePic email gender business_type user_type tokens vaiID averageRating",
			})
			.populate("comments.userId", "name profilePic gender")
			.sort({ createdAt: -1 });

		var otherPosts = await MarketPlacePost.find({
			// "date.from": { $lte: new Date('DD/MM/YYYY').toString() },
			// "date.to": { $gte: new Date('DD/MM/YYYY').toString() },
			featurelisting: false
		})
			.populate({
				path: "userId",
				select: "userId name profilePic email gender business_type user_type tokens vaiID averageRating",
			})
			.populate("comments.userId", "name profilePic gender")
			.sort({ createdAt: -1 });

		otherPosts = otherPosts.filter((post) => {
			const from = parseDate(post.date?.from);
			const to = parseDate(post.date?.to);
			return from.isSameOrBefore(currentDate) && to.isSameOrAfter(currentDate);
		});

		featuredPosts = featuredPosts.filter((post) => {
			const from = parseDate(post.date?.from);
			const to = parseDate(post.date?.to);
			return from.isSameOrBefore(currentDate) && to.isSameOrAfter(currentDate);
		});

		featuredPosts = JSON.parse(JSON.stringify(featuredPosts))
		otherPosts = JSON.parse(JSON.stringify(otherPosts))
		var posts = [...featuredPosts, ...otherPosts]
		posts = posts.filter(post => {
			const from = moment(`${post.date?.from} ${post.time?.from}`, 'DD/MM/YYYY hh:mm A');
			let to = moment(`${post.date?.to} ${post.time?.to}`, 'DD/MM/YYYY hh:mm A');

			if (to.isBefore(from)) {
				to.add(1, 'day');
			}

			return moment().isBetween(from, to);
			// moment().isBetween(moment(post.time.from, 'hh:mm A'), moment(post.time.to, 'hh:mm A'))
		}
		)

		// Calculate totalComments and totalLikes for each post
		const postsWithComments = [];

		for (const post of posts) {
			const totalComments = post.comments.length;
			const totalLikes = post.likes.length;

			// Calculate and add comment timestamps relative to the current time
			const commentsWithTimestamps = post?.comments.map(comment => {
				const createdAtMoment = moment(comment.createdAt);
				const now = moment();
				const diffMinutes = now.diff(createdAtMoment, "minutes");

				// Customize the time format based on the time difference
				if (diffMinutes < 60) {
					return {
						// ...comment.toObject(),
						...comment,
						timeAgo: `${diffMinutes}m`,
					};
				} else if (diffMinutes < 1440) {
					const diffHours = Math.floor(diffMinutes / 60);
					return {
						// ...comment.toObject(),
						...comment,
						timeAgo: `${diffHours}h`,
					};
				} else if (
					createdAtMoment.isSame(
						now.clone().subtract(1, "day"),
						"day",
					)
				) {
					return {
						// ...comment.toObject(),
						...comment,
						timeAgo: "yesterday",
					};
				} else {
					return {
						// ...comment.toObject(),
						...comment,
						timeAgo: createdAtMoment.format("MMM D"),
					};
				}
			});

			const serviceData = await Services.find(
				{ userId: post?.userId?._id },
				{ serviceType: 1 },
			);
			const serviceTypes = serviceData
				.map(item => item.serviceType)
				.flat();
			const uniqueServiceTypes = [...new Set(serviceTypes)].filter(
				type => type !== "",
			);

			const postWithComments = {
				...post,
				comments: commentsWithTimestamps,
				totalComments,
				totalLikes,
				serviceData: uniqueServiceTypes,
			};

			postsWithComments.push(postWithComments);
		}

		res.status(200).json(postsWithComments);
	} catch (error) {
		console.log(error, ' <=== error...')
		res.status(500).json({
			error: "An error occurred while fetching user details",
		});
	}
};
export const createMarketPost = async (req, res) => {

	try {

		const data = req.fields;
		const file = req.files;
		var image = "";

		if (file) {
			const folderName = "marketplacePost";
			await uploadToS3(folderName, file.buffer, file.filename.filename, file.filename.mimetype)
				.then(url => {
					console.log('File uploaded successfully in Marketplace post:', url);
					image = url;
				})
				.catch(err => console.error('Error uploading file in Marketplace post:', err));
		}

		if (data?.image) {
			image = data?.image;
		}

		data.image = image;
		const user = await User.findById(data.userId);
		const profile = await profileDetails.findOne({ userId: data.userId });

		const timeFrom = data['time.from'].split(" ")[1];
		const timeTo = data['time.to'].split(" ")[1];

		const formattedTimeFrom = moment(timeFrom, "HH:mm:ss").format("hh:mm A");
		const formattedTimeTo = moment(timeTo, "HH:mm:ss").format("hh:mm A");

		data['time.from'] = formattedTimeFrom;
		data['time.to'] = formattedTimeTo;
		if (!user) {
			return res.status(404).json({ message: "User not found." });
		}
		if (!data.totalGRT) {
			return res.status(404).json({ message: "Tokens not found." });
		}
		if (data.totalGRT > user.tokens) {
			return res
				.status(404)
				.json({ message: "User tokens not available" });
		}
		if (data.totalGRT <= 0) {
			return res.status(400).json({ message: "Tokens not found." });
		}
		// user.tokens = parseFloat(user.tokens) - parseFloat(data.tokens);
		user.tokens = parseFloat(user.tokens) - parseFloat(data.totalGRT);
		await user.save();

		data.tokensavailable = "Yes";
		data.currentpost = 1;
		data.gender = profile?.gender;
		data.orientation = profile?.orientation;
		data.age = profile?.age;
		data.typeofbusiness = profile?.typeofbusiness;
		data.user_type = user?.user_type;
		data.likes = !data.likes ? [] : data.likes;
		data.comments = !data.comments
			? []
			: !Array.isArray(data.comments)
				? []
				: data.comments;

		const MarketPost = new MarketPlacePost(data);

		// Save the document to the database
		await MarketPost.save();

		// send notification to all followers with verified rule
		const followers = await Follower.find({ userId: data.userId }).populate(
			"follower_id",
		);

		for (let follower of followers) {
			if (follower?.isNotifyWhenPost === true) {
				sendNotification(
					data.userId,
					follower?.follower_id?._id?.toString(),
					"MARKETPLACE_FEED_POST",
					`${follower?.follower_id?.name} Just posted!`,
					`${follower?.follower_id?.name} has just posted in marketplace`,
				);
			}
		}

		res.status(200).json({
			message: "Post created successfully",
			MarketPost,
		});


	} catch (error) {
		console.log(error, " <=== error....");
		res.status(500).json({
			error: "An error occurred while creating user details",
		});
	}
};

export const get = async (req, res) => {
	try {
		console.log("Cron Job running");
		// Function to convert a date string in "dd/mm/yyyy" format to a Date object
		const currentDate = moment().format("DD/MM/YYYY");

		const userDetails = await MarketPlacePost.find({
			frequency: { $exists: true },
			tokensavailable: "Yes",
			"date.from": { $lte: currentDate },
			"date.to": { $gte: currentDate },

			// "time.from": { $lte: currentHours },
			// "time.to": { $gte: currentHours },
		}).sort("-_id");

		if (!userDetails || userDetails.length === 0) {
			console.log("No user details with frequency found.");
			return;
		}

		const futureUserDetails = [];

		for (const userDetail of userDetails) {
			const { createdAt, frequency, date, customCreatedAt, time } =
				userDetail;

			const newTimestamp = moment(createdAt)
				.add(frequency, "hours") // change minutes to hours when in production
				.format("DD/MM/YYYY, h:mm:ss");
			const currentTimestamp = moment().format("DD/MM/YYYY, h:mm:ss");
			const userFromTime = moment(time.from, "hh:mm A");
			const userToTime = moment(time.to, "hh:mm A");
			const currentHours = moment();

			if (currentHours?.isBetween(userFromTime, userToTime)) {
				// if (currentHours >= userFromTime && currentHours <= userToTime) {
				// }
				if (newTimestamp <= currentTimestamp) {
					const { _id, userId, ...rest } = userDetail;

					// Delete old post
					await MarketPlacePost.findByIdAndDelete(_id);
					// User tokens
					// const user = await User.findById(userId);
					// if (!user.tokens) {
					// 	return res
					// 		.status(404)
					// 		.json({ message: "User tokens not available" });
					// }
					// user.tokens = parseFloat(user.tokens) - 1;
					// await user.save();
					// // create new post
					const newPost = new MarketPlacePost({
						...userDetail.toObject(),
						currentpost: userDetail.currentpost + 1,
						userId: userId.toString(),
						createdAt: new Date(),
						customCreatedAt: moment().format("DD/MM/YYYY, h:mm:ss"),
						customUpdatedAt: moment().format("DD/MM/YYYY, h:mm:ss"),
						_id: undefined, // Remove _id field to create a new post
					});
					await newPost.save();
				}
			}
		}
	} catch (error) {
		if (res) {
			res.status(500).send("Internal Server Error"); // Handle errors and send an appropriate response
		} else {
			// Handle the error without a response object (e.g., log it or perform other actions)
		}
	}
};

// Schedule the API function to run every minute
cron.schedule("*/1 * * * *", () => {
	get(); // Call API function
});

export const getMarketPost = async (req, res) => {
	const { userId } = req.params;
	try {
		const userDetails = await MarketPlacePost.find({ userId }).sort("-_id");

		if (!userDetails) {
			return res.status(404).json({ error: "Post details not found" });
		}

		res.status(200).json(userDetails);
	} catch (error) {
		res.status(500).json({
			error: "An error occurred while fetching user details",
		});
	}
};

export const updateMarketPost = async (req, res) => {
	const { id } = req.params;
	const { data } = req.body;
	try {
		const Market = await MarketPlacePost.findById(id);
		if (!Market) {
			return res
				.status(404)
				.json({ message: "MarketPlace post not found." });
		}

		const MarketPost = await MarketPlace.findByIdAndUpdate(id, data, {
			new: true,
		});
		if (!MarketPost) {
			return res
				.status(404)
				.json({ error: "MarketPlace post not found." });
		}

		res.status(200).json({ MarketPost, message: "Update successfully" });
	} catch (error) {
		res.status(500).json({
			error: "An error occurred while updating country status.",
		});
	}
};

export const DeleteMarketPlacePost = async (req, res) => {
	const { id, s3_url } = req.query;
	try {
		const postDetails = await MarketPlacePost.findById(id);
		const userDetails = await MarketPlacePost.findByIdAndDelete(id);
		const fileUrl = `${s3_url}/${postDetails?.image}`
		await deleteFilesFromFolder(fileUrl)
		if (!userDetails) {
			return res.status(404).json({ message: "Post not found" });
		}
		res.status(200).json({ message: "Delete successfully" });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const likeMarketPlacePost = async (req, res) => {
	try {
		const postId = req.params.postId;
		const userId = req.body.userId;

		const post = await MarketPlacePost.findById(postId);
		if (!post) {
			return res.status(404).json({ error: "Post not found." });
		}

		const userIndex = post.likes.indexOf(userId);

		if (userIndex !== -1) {
			// User has already liked the post, so remove the like
			post.likes.splice(userIndex, 1);
		} else {
			// User hasn't liked the post, so add the like
			post.likes.push(userId);
		}

		await post.save();

		res.status(200).json(post);
	} catch (error) {
		res.status(500).json({
			error: "An error occurred while toggling the like.",
		});
	}
};

export const addCommentToMarketPlacePost = async (req, res) => {
	try {
		const postId = req.params.postId;
		const { userId, text } = req.body;

		const post = await MarketPlacePost.findById(postId);
		if (!post) {
			return res.status(404).json({ error: "Post not found." });
		}

		const newComment = {
			userId,
			text,
		};

		post.comments.push(newComment);
		await post.save();

		res.status(200).json(post);
	} catch (error) {
		res.status(500).json({
			error: "An error occurred while adding the comment.",
		});
	}
};

export const getAllCommentsMarketPlacePost = async (req, res) => {
	try {
		const postId = req.params.postId;

		const post = await MarketPlacePost.findById(postId)
			.populate({
				path: "comments",
				populate: {
					path: "userId",
					select: "userId name profilePic gender",
				},
			})
			.exec();

		if (!post) {
			return res.status(404).json({ error: "Post not found." });
		}

		// Calculate timeAgo for each comment
		const commentsWithTimestamps = post.comments.map(comment => {
			const createdAtMoment = moment(comment.createdAt);
			const now = moment();
			const diffMinutes = now.diff(createdAtMoment, "minutes");

			// Customize the time format based on the time difference
			if (diffMinutes < 60) {
				return {
					...comment.toObject(),
					timeAgo: `${diffMinutes}m`,
				};
			} else if (diffMinutes < 1440) {
				const diffHours = Math.floor(diffMinutes / 60);
				return {
					...comment.toObject(),
					timeAgo: `${diffHours}h`,
				};
			} else if (
				createdAtMoment.isSame(now.clone().subtract(1, "day"), "day")
			) {
				return {
					...comment.toObject(),
					timeAgo: "yesterday",
				};
			} else {
				return {
					...comment.toObject(),
					timeAgo: createdAtMoment.format("MMM D"),
				};
			}
		});

		res.json(commentsWithTimestamps);
	} catch (error) {
		res.status(500).json({
			error: "An error occurred while retrieving comments.",
		});
	}
};
