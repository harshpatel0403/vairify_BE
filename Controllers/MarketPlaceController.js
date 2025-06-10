import MarketPlace from "../Models/MarketPlaceModal.js";
import Services from "../Models/ServicesModal.js";
import profileDetails from "../Models/ProfileModal.js";
import User from "../Models/UserModal.js";
import mongoose from "mongoose";
import { sendNotification } from "../Config/utils.js";

export const createMarketSearch = async (req, res) => {
	const { userId } = req.body;
	try {
		if (!userId) {
			return res.status(400).json({ error: "Invalid request body" });
		}

		// Create a new Market document
		const MarketSearch = new MarketPlace({
			...req.body,
			status: "pending",
		});

		// Save the document to the database
		await MarketSearch.save();

		if (req?.body?.invitee) {
			const userIds = req?.body?.invitee?.map(item => item?.id);

			for (let userId of userIds) {
				try {
					await sendNotification(
						req?.user?._id,
						userId,
						"INVITATION_REQUEST",
						`New invitation request.`,
						`New invitation request recieved.`,
					);
				} catch (error) {
					// console.log(error)
				}
			}
		}

		res.status(200).json({ message: "Save successfully", MarketSearch });
	} catch (error) {
		console.log(error);
		res.status(500).json({
			error: "An error occurred while creating user details",
		});
	}
};
export const updateMarketSearch = async (req, res) => {
	const { id } = req.params;
	const { inviteeId, inviteeStatus } = req.body;
	try {
		const query = {
			_id: id,
			"invitee.id": inviteeId,
		};

		const update = {
			$set: {
				"invitee.$.status": inviteeStatus,
			},
		};
		const Market = await MarketPlace.findById(id);
		if (!Market) {
			return res.status(404).json({ message: "MarketSearch not found." });
		}

		if (!inviteeId) {
			const MarketSearch = await MarketPlace.findByIdAndUpdate(
				id,
				{ ...req.body, status: "pending" },
				{
					new: true,
				},
			);
			if (!MarketSearch) {
				return res
					.status(404)
					.json({ error: "MarketSearch not found." });
			}

			res.status(200).json({
				MarketSearch,
				message: "Update successfully",
			});
		} else {
			const MarketSearch = await MarketPlace.updateMany(query, update, {
				new: true,
			});
			if (!MarketSearch) {
				return res
					.status(404)
					.json({ error: "MarketSearch not found." });
			}
			if (req?.body?.inviteeStatus === "cancel") {
				await sendNotification(
					inviteeId,
					Market?.userId?.toString(),
					"INVITATION_REQUEST",
					"Invitation rejected",
					"One of your invitation is rejected!",
				);
			} else {
				await sendNotification(
					inviteeId,
					Market?.userId?.toString(),
					"INVITATION_REQUEST",
					"Update on Invitation",
					"One of your invitation is updated!",
				);
			}

			res.status(200).json({
				MarketSearch,
				message: "Update successfully",
			});
		}
	} catch (error) {
		res.status(500).json({
			error: "An error occurred while updating country status.",
		});
	}
};

export const getMarketSearch = async (req, res) => {
	const { userId } = req.params;
	const { inquiry } = req.query;

	try {
		const query = { userId };
		if (inquiry) {
			query.inquiry = inquiry;
		}
		const userDetails = await MarketPlace.find(query)
			.sort("-_id")
			.populate(
				"userId",
				"affiliate_url business_name business_type bussiness_vai country email name gender profilePic user_type vaiID",
			);

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
// export const getMarketSearchResult = async (req, res) => {
//   const { id } = req.params;
//   // const servicesName = ["Grinding", "Sexy Bartender"];
//   // const radious = "Within 15 mi (25 km)";
//   // const gender = "Man";
//   // const location = "UK";
//   // const orientation = "M4M";
//   // const venue = "Incall";

//   try {
//     const userDetails = await MarketPlace.findById(id);
//     if (!userDetails) {
//       return res.status(404).json({ message: "Result not found" });
//     }

//     const results = await profileDetails.aggregate([
//       {
//         $match: {
//           $or: [
//             { "services.servicesName": { $in: userDetails?.advancedservices } },
//             { location: userDetails?.location },
//             { gender: userDetails?.gender },
//             { orientation: userDetails?.orientation },
//             { venue: userDetails?.venue },
//           ],
//         },
//       },
//       {
//         $lookup: {
//           from: "services", // Collection name for services
//           localField: "userId",
//           foreignField: "userId",
//           as: "services",
//         },
//       },
//       {
//         $unwind: "$services",
//       },
//       {
//         $match: {
//           $or: [
//             { "services.servicesName": { $in: userDetails?.advancedservices } },
//             { location: userDetails?.location },
//             { gender: userDetails?.gender },
//             { orientation: userDetails?.orientation },
//             { venue: userDetails?.venue },
//           ],
//         },
//       },
//     ]);

//     res.status(200).json(results);
//   } catch (error) {
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };

export const getMarketSearchResult = async (req, res) => {
	const { id } = req.params;
	const { status } = req.query;
	const gender = "Man";
	const location = "UK";
	const orientation = "M4M";
	const venue = "Incall";
	const desiredServices = ["Grinding", "Sexy Bartender"]; // Services you're looking for

	try {
		if (!status) {
			const userDetails = await MarketPlace.findById(id);
			if (!userDetails) {
				return res.status(404).json({ message: "Result not found" });
			}
			const data = await matchProfileData(userDetails);
			res.status(200).json(data);
		} else {
			const userDetails = await MarketPlace.findOne({
				_id: id,
				"invitee.status": "accept",
			});
			if (!userDetails) {
				return res
					.status(200)
					.json({ result: [], message: "Result not found" });
			}
			const acceptedInviteeIds = userDetails?.invitee
				?.filter(invitee => invitee?.status === "accept")
				.map(invitee => invitee.id);

			const profiles = await profileDetails
				.find({ userId: { $in: acceptedInviteeIds } })
				.populate(
					"userId",
					"name email country phone whatsapp address user_type gender vaiID",
				)
				.exec();

			const servicesPromises = profiles.map(profile => {
				return Services.findOne({ userId: profile.userId }).exec();
			});

			const servicesData = await Promise.all(servicesPromises);

			// Combine profile and services data
			const result = profiles.map((profile, index) => {
				return {
					profile: profile,
					services: servicesData[index],
				};
			});
			if (result.length > 0) {
				res.status(200).json({
					result,
					message: `${result.length} result fount`,
				});
			} else {
				res.status(401).json({ result, message: "Result not found" });
			}
		}
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

const matchProfileData = async userDetails => {
	try {
		const {
			userId,
			location,
			gender,
			orientation,
			venue,
			build,
			height,
			eyescolor,
			haircolor,
			hairlength,
			weight,
			piercings,
			publichair,
			breastappearance,
			breasttype,
			tattoos,
			type,
			typespecialty,
			catagory,
			advancedservices,
			// TODO: implement this filter once get the place for truevu
			trurevu,
		} = userDetails;

		const profileDetailsQuery = [
			{ build: build },
			{ height: height },
			{ eyescolor: eyescolor },
			{ haircolor: haircolor },
			{ hairlength: hairlength },
			{ weight: weight },
			{ piercings: piercings },
			{ publichair: publichair },
			{ breastappearance: breastappearance },
			{ breasttype: breasttype },
			{ tattoos: tattoos },
			// { type: type },
			{ typespecialty: typespecialty },
		].filter(item => Object.values(item)[0]);
		const query = {
			userId: { $ne: userId }, // Exclude your own user ID
		};
		if (profileDetailsQuery?.length) {
			query["$and"] = profileDetailsQuery;
		}

		if (orientation) {
			query.orientation = orientation;
		}
		if (gender) {
			query.gender = gender;
		}
		if (location !== "Current Location") {
			query.country = location;
		}

		const servicesQuery = {
			"services.serviceType": { $in: [catagory] },
		};

		if (advancedservices?.length) {
			servicesQuery["services.services.servicesName"] = {
				$all: advancedservices,
			};
		}

		let currentUserType = await User.findById(userId);
		currentUserType = currentUserType?.user_type;

		let qry = [
			{
				$match: query,
			},
			{
				$lookup: {
					from: "services", // Collection name for services
					localField: "userId",
					foreignField: "userId",
					as: "services",
				},
			},
			{
				$lookup: {
					from: "users", // Collection name for users
					localField: "userId",
					foreignField: "_id",
					as: "userId",
					pipeline: [
						{
							$lookup: {
								from: "reviews",
								localField: "_id",
								foreignField: "reviewee",
								as: "reviews",
							},
						},
						{
							$lookup: {
								from: "calendarschedules",
								localField: "_id",
								foreignField: "userId",
								as: "schedules",
								pipeline: [
									{
										$match: {
											status: "active",
										},
									},
								],
							},
						},
					],
				},
			},
			{
				$match: {
					$or: [
						{
							["userId.schedules.venue"]: venue,
						},
						{
							["userId.schedules.venue"]: "Both",
						},
					],
				},
			},
			{
				$unwind: "$userId",
			},
			{
				$unwind: "$services",
			},
			{
				$match: servicesQuery,
			},
			{
				$match: {
					"userId.user_type": {
						$ne: currentUserType,
					},
					"userId.averageRating": {
						$gte: parseFloat(trurevu?.from || 0),
						$lte: parseFloat(trurevu?.to || 5),
					},
				},
			},
		];

		const profiles = await profileDetails.aggregate(qry);

		const result = profiles.map((profile, index) => {
			let data = { profile };
			data.services = data.profile.services;
			delete data.profile.services;
			return data;
		});

		if (result.length > 0) {
			return { result, message: `${result.length} result found` };
		}
		{
			return { result, message: "Result not found" };
		}
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const Invitation = async (req, res) => {
	const userDetails = req.body;
	console.log("user details", userDetails);
	try {
		const data = await matchProfileData(userDetails);

		res.status(200).json(data);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

const matchProfileDataMarketplace = async userDetails => {
	try {
		const { userIds } = userDetails;

		const query = {
			userId: {
				$in: userIds?.map(item => new mongoose.Types.ObjectId(item)),
			},
		};

		console.log(query);

		const profiles = await profileDetails.aggregate([
			{
				$match: query,
			},
			{
				$lookup: {
					from: "services", // Collection name for services
					localField: "userId",
					foreignField: "userId",
					as: "services",
				},
			},
			{
				$lookup: {
					from: "users", // Collection name for users
					localField: "userId",
					foreignField: "_id",
					as: "userId",
					pipeline: [
						{
							$lookup: {
								from: "reviews",
								localField: "_id",
								foreignField: "reviewee",
								as: "reviews",
							},
						},
					],
				},
			},
			{
				$unwind: "$userId",
			},
			{
				$unwind: "$services",
			},
		]);

		const result = profiles.map((profile, index) => {
			let data = { profile };
			data.services = data.profile.services;
			delete data.profile.services;
			return data;
		});

		if (result.length > 0) {
			return { result, message: `${result.length} result fount` };
		}
		{
			return { result, message: "Result not found" };
		}
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const marketplaceInvitation = async (req, res) => {
	const userDetails = req.body;
	try {
		const data = await matchProfileDataMarketplace(userDetails);

		res.status(200).json(data);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const DeleteMarketPlace = async (req, res) => {
	const { id } = req.params;
	try {
		const userDetails = await MarketPlace.findByIdAndDelete(id);
		if (!userDetails) {
			return res.status(404).json({ message: "Result not found" });
		}
		res.status(200).json({ message: "Delete successfully" });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const myinvitation = async (req, res) => {
	const { id } = req.params;

	try {
		const data = await MarketPlace.find({ "invitee.id": id })
			.sort("-_id")
			.populate(
				"userId",
				"affiliate_url business_name business_type bussiness_vai country email name gender profilePic user_type vaiID averageRating",
			);

		if (!data || data.length === 0) {
			return res
				.status(404)
				.json({ message: "No data found for the provided invited id" });
		}

		res.status(200).json(data);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const searchFromVairifyId = async (req, res) => {
	const { id } = req.params;

	try {
		const profiles = await profileDetails.aggregate([
			{
				$lookup: {
					from: "users", // Assuming the collection name is "users"
					localField: "userId",
					foreignField: "_id",
					as: "userDetails",
				},
			},
			{
				$match: {
					"userDetails.vaiID": {
						$regex: new RegExp("^" + id.toLowerCase(), "i"),
					},
				},
			},
			{
				$project: {
					userDetails: 0, // Exclude the userDetails field from the output
				},
			},
			{
				$lookup: {
					from: "services", // Collection name for services
					localField: "userId",
					foreignField: "userId",
					as: "services",
				},
			},
			{
				$lookup: {
					from: "users", // Collection name for users
					localField: "userId",
					foreignField: "_id",
					as: "userId",
					pipeline: [
						{
							$lookup: {
								from: "reviews",
								localField: "_id",
								foreignField: "reviewee",
								as: "reviews",
							},
						},
					],
				},
			},
			{
				$unwind: {
					path: "$userId",
					preserveNullAndEmptyArrays: true
				}
			},
			{
				$unwind: {
					path: "$services",
					preserveNullAndEmptyArrays: true
				}
			},
		]);

		const result = profiles.map((profile, index) => {
			let data = { profile };
			data.services = data.profile.services;
			delete data.profile.services;
			return data;
		});

		if (result.length > 0) {
			res.status(200).json({
				result,
				message: `${result.length} result fount`,
			});
		} else {
			res.status(200).json({ result, message: "Result not found" });
		}
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Internal Server Error" });
	}
};
