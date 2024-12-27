import moment from "moment";
import UsersPost from "../Models/UsersPostModal.js";

export const createUserPost = async (req, res) => {
	try {
		const { userId, description } = req.body;
		var image = "";
		if (req.file) {
			const timestamp = moment().format("YYYYMMDDHHmmss");
			const originalname = req.file.originalname.replace(/ /g, ""); // Remove spaces

			const filename = `${timestamp}-${originalname}`;
			image = filename;
		}

		const usersPost = new UsersPost({ userId, image: image, description });
		const savedPost = await usersPost.save();
		res.json(savedPost);
	} catch (error) {
		res.status(500).json({
			error: "An error occurred while creating the user post.",
		});
	}
};

export const getAllUserPosts = async (req, res) => {
	try {
		const posts = await UsersPost.find().sort({ createdAt: -1 });
		const postsWithCounts = await Promise.all(
			posts.map(async post => {
				const totalComments = post.comments.length;
				const totalLikes = post.likes.length;
				return { ...post.toObject(), totalComments, totalLikes };
			}),
		);

		res.json(postsWithCounts);
	} catch (error) {
		res.status(500).json({
			error: "An error occurred while retrieving user posts.",
		});
	}
};

export const likeUserPost = async (req, res) => {
	try {
		const postId = req.params.postId;
		const userId = req.body.userId;

		const post = await UsersPost.findById(postId);
		if (!post) {
			return res.status(404).json({ error: "Post not found." });
		}

		if (post.likes.includes(userId)) {
			return res
				.status(400)
				.json({ error: "You've already liked this post." });
		}

		post.likes.push(userId);
		await post.save();

		res.json(post);
	} catch (error) {
		res.status(500).json({
			error: "An error occurred while liking the post.",
		});
	}
};

export const addCommentToUserPost = async (req, res) => {
	try {
		const postId = req.params.postId;
		const { userId, text } = req.body;

		const post = await UsersPost.findById(postId);
		if (!post) {
			return res.status(404).json({ error: "Post not found." });
		}

		const newComment = {
			userId,
			text,
		};

		post.comments.push(newComment);
		await post.save();

		res.json(post);
	} catch (error) {
		res.status(500).json({
			error: "An error occurred while adding the comment.",
		});
	}
};

export const getAllCommentsForUserPost = async (req, res) => {
	try {
		const postId = req.params.postId;

		const post = await UsersPost.findById(postId)
			.populate({
				path: "comments",
				populate: {
					path: "userId",
					select: "userId name profilePic",
				},
			})
			.exec();

		if (!post) {
			return res.status(404).json({ error: "Post not found." });
		}

		res.json(post.comments);
	} catch (error) {
		res.status(500).json({
			error: "An error occurred while retrieving comments.",
		});
	}
};
