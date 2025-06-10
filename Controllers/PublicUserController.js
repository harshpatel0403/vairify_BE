import User from "../Models/UserModal.js";
import Reviews from "../Models/ReviewModal.js";
import Follower from "../Models/FollowerModal.js";
import Favourite from "../Models/FavouriteModal.js";

async function getPublicUserProfile(req, res) {
	try {
		const vaiId = req.params.vaiId;
		const user = await User.findOne({
			vaiID: {
				$regex: new RegExp("^" + vaiId.toLowerCase(), "i"),
			}
		});
		console.log(vaiId.toLowerCase(), user, ' <== I am user...')
		if (!user) {
			return res.status(404).send({ message: "user not found" })
		}

		const profileReviews = await Reviews?.find({ reviewee: user?._id });
		const givenReviews = await Reviews?.find({ reviewer: user?._id });
		const followers = await Follower?.find({ follower_id: user?._id });
		const favourites = await Favourite?.find({ userId: user?._id });

		return res.send({
			...JSON.parse(JSON.stringify(user)),
			profileReviews,
			givenReviews,
			followers,
			favourites,
		})
	} catch (error) {
		console.log(error)
		return res.status(500).send({ message: "Internal Server Error" })
	}
}

export {
	getPublicUserProfile
};
