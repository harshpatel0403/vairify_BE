import express from "express";
import {
	createProfileDetails,
	getProfileDetails,
	getVairifyUserDetails,
	updateNotify,
	getMyVairify,
	addFollower,
	addFavourite,
	getUserFollowers,
	removeFollower,
	removeFavourite,
	getUserFavourites,
	getUserNotifyRules,
	updateProfilePermission,
	memberShipCancelled,
	kycCancelled,
	updateProfileDetails,
} from "../Controllers/ProfileController.js";

const profileRouter = express.Router();

profileRouter.post("/create", createProfileDetails);
profileRouter.get("/get-profile/:userId", getProfileDetails);
profileRouter.put("/:userId/update", updateProfileDetails);
profileRouter.post("/follow/:userId", addFollower);
profileRouter.post("/unfollow/:userId", removeFollower);
profileRouter.post("/favourite/:userId", addFavourite);
profileRouter.post("/unfavourite/:userId", removeFavourite);
profileRouter.get("/get_my_vairify/:userId", getMyVairify);
profileRouter.get("/get_my_followers/:userId", getUserFollowers);
profileRouter.get("/get_my_favourites/:userId", getUserFavourites);
profileRouter.post(
	"/get_my_vairify_user_detail/:userId",
	getVairifyUserDetails,
);
profileRouter.post("/update_notify/:userId", updateNotify);
profileRouter.get("/notify_rules/:userId/:followerId", getUserNotifyRules);

profileRouter.post(
	"/update_profile_permission/:userId",
	updateProfilePermission,
);

profileRouter.post("/cancelled_membership/:userId", memberShipCancelled);
profileRouter.post("/cancelled_kyc/:userId", kycCancelled);

export default profileRouter;
