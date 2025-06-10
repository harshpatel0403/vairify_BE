import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname } from "path";
// import multer from "multer";
import connectDB from "./Config/database.js";
import { ComplyCube, EventVerifier } from "@complycube/api";

import userRouter from "./Routes/UserRoutes.js";
import bannerrRouter from "./Routes/BannerRoute.js";
import countryRouter from "./Routes/CountryRoute.js";
import GrtPackageRoute from "./Routes/GrtPackageRoute.js";
import contactRoute from "./Routes/ContactAdminRoute.js";
import importantDetailRouter from "./Routes/ImportantDetailRoute.js";
import VairifyNowRouter from "./Routes/VarifyNowRoute.js";
import coupounRoute from "./Routes/CouponRoute.js";
import userVaripay, {
	UserVaripayPublicRoutes,
} from "./Routes/UserVaripayRoutes.js";
import userSocial from "./Routes/UserSocialRoute.js";
import UserGalleryRoute, {
	UserGalleryPublicRoute,
} from "./Routes/UserGalleryRoute.js";
import UserPostRoute from "./Routes/UserPostRoute.js";
import KycDetailRoute from "./Routes/KycDetailRoute.js";
import userDetailRoute from "./Routes/UserDetailsRoutes.js";
import userVaripayRequestRoute from "./Routes/UserVaripayRequestRoute.js";
import {
	servicesRouter,
	servicesPublicRouter,
} from "./Routes/ServicesRoute.js";
import profileRouter from "./Routes/ProfileRoute.js";
import marketRouter from "./Routes/MarketPlaceRoute.js";
import marketPostRouter from "./Routes/MarketPlacePostRoute.js";
import DateGuarCodeRoute from "./Routes/DateGuardCodeRoute.js";
import DateGuarGroupRoute from "./Routes/DateGuardGroupRoute.js";
import DateGuarMemberRoute from "./Routes/DateGuardMemberRoute.js";
import DateGuarAlarmRoute from "./Routes/DateGuardAlarmRoute.js";
import calenderRouter from "./Routes/CalendarSchedulesRoute.js";
import VaridateRoutes, {
	VaridatePublicRoutes,
} from "./Routes/VaridateRoute.js";
import StaffRoutes from "./Routes/StaffRoutes.js";
import NotificationRoutes from "./Routes/NotificationRoutes.js";
import NewsletteRoute from "./Routes/NewsletterRoute.js";
import KycRouter from "./Routes/KycRouter.js";
import plansRoute from "./Routes/PlanRoute.js";
import transactionRoute from "./Routes/TransactionRoute.js";
import { tokenVerification } from "./Config/apiVerify.js";

import http from "http";
import { Server } from "socket.io";
import { spawn } from "child_process";
import webpush from "web-push";

dotenv.config();
connectDB();
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
	cors: {
		origin: "*",
	},
});
app.use(bodyParser.json({ limit: "50mb" }));
app.set("trust proxy", 1);
app.use(cors());
app.use(express.json({ limit: "50mb" }));

// app.use(
// 	cors({
// 		origin: '*',
// 		methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
// 		allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
// 		credentials: true
// 	})
// );



const webhookSecret = process.env.COMPLYCUBE_WEBHOOK_SECRET;
const complycube = new ComplyCube({ apiKey: process.env.COMPLYCUBE_API_TOKEN });
const eventVerifier = new EventVerifier(webhookSecret);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

webpush.setVapidDetails(
	process.env.WEB_PUSH_CONTACT,
	process.env.PUBLIC_VAPID_KEY,
	process.env.PRIVATE_VAPID_KEY,
);

app.use(express.static(__dirname + "/public/uploads/countries"));
app.use("/api/images/countries", express.static("public/uploads/countries"));

app.use(
	"/api/images/countries",
	express.static(`${__dirname}/public/uploads/countries`),
);
app.use(
	"/api/images/languages",
	express.static(`${__dirname}/public/uploads/languages`),
);
app.use(
	"/api/images/cities",
	express.static(`${__dirname}/public/uploads/cities`),
);
app.use(
	"/api/images/varipays",
	express.static(`${__dirname}/public/uploads/varipays`),
);
app.use(
	"/api/v1/images/socials",
	express.static(`${__dirname}/public/uploads/socials`),
);
app.use(
	"/api/images/banners",
	express.static(`${__dirname}/public/uploads/banners`),
);
app.use(
	"/api/images/issues",
	express.static(`${__dirname}/public/uploads/issues`),
);
app.use(
	"/api/images/users",
	express.static(`${__dirname}/public/uploads/users`),
);
app.use(
	"/api/images/usersPost",
	express.static(`${__dirname}/public/uploads/marketPost`),
);
app.use(
	"/api/images/marketPost",
	express.static(`${__dirname}/public/uploads/marketPost`),
);
app.use(
	"/api/images/userkyc",
	express.static(`${__dirname}/public/uploads/userkyc`),
);
app.use(
	"/api/images/user_varipays",
	express.static(`${__dirname}/public/uploads/user_varipays`),
);
app.use(
	"/api/images/usergallery",
	express.static(`${__dirname}/public/uploads/usergallery`),
);
app.use(
	"/api/images/userprofile",
	express.static(`${__dirname}/public/uploads/usersProfile`),
);
app.use(
	"/api/images/manualSelfies",
	express.static(`${__dirname}/public/uploads/manualSelfies`),
);
app.use(
	"/api/images/dateguard",
	express.static(`${__dirname}/public/uploads/dateguard`),
);
app.use(
	"/api/images/faceimages",
	express.static(`${__dirname}/public/uploads/faceimages`),
);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/public", publicUserRouter);
app.use("/api/v1/banner", tokenVerification, bannerrRouter);
app.use("/api/v1/country", countryRouter);
app.use("/api/v1/grtPackage", tokenVerification, GrtPackageRoute);
app.use("/api/v1/contactAdmin", tokenVerification, contactRoute);
app.use("/api/v1/vairifynow", VairifyNowRouter);
app.use("/api/v1/important-details", tokenVerification, importantDetailRouter);
app.use("/api/v1/coupons", tokenVerification, coupounRoute);
app.use("/api/v1/uservaripays", UserVaripayPublicRoutes);
app.use("/api/v1/uservaripays", tokenVerification, userVaripay);
app.use("/api/v1/usersocials", userSocial); //tokenVerification,
app.use("/api/v1/usergallery", UserGalleryPublicRoute);
app.use("/api/v1/usergallery", tokenVerification, UserGalleryRoute);

app.use("/api/v1/userPosts", tokenVerification, UserPostRoute);
app.use("/api/v1/userkyc", tokenVerification, KycDetailRoute);
app.use("/api/v1/userdetail", tokenVerification, userDetailRoute);
app.use(
	"/api/v1/uservaripayRequest",
	// tokenVerification,
	userVaripayRequestRoute,
);
app.use("/api/v1/services", servicesPublicRouter);
app.use("/api/v1/services", tokenVerification, servicesRouter);

app.use("/api/v1/profile", profileRouter);
app.use("/api/v1/market", tokenVerification, marketRouter);
app.use("/api/v1/market/post", tokenVerification, marketPostRouter);
app.use("/api/v1/dateguardcodes", tokenVerification, DateGuarCodeRoute);
app.use("/api/v1/dateguardgroup", tokenVerification, DateGuarGroupRoute);
app.use("/api/v1/dateguardalarm", tokenVerification, DateGuarAlarmRoute);
app.use("/api/v1/dateguardmember", tokenVerification, DateGuarMemberRoute);
app.use("/api/v1/calendar", calenderRouter);
app.use("/api/v1/feature-access", tokenVerification, featureRouter);

app.use("/api/v1/varidate", VaridatePublicRoutes);
app.use("/api/v1/varidate", tokenVerification, VaridateRoutes);
app.use("/api/v1/business", tokenVerification, StaffRoutes);
app.use("/api/v1/notification", tokenVerification, NotificationRoutes);
app.use("/api/v1/newsletter", tokenVerification, NewsletteRoute);
app.use("/api/v1/kyc", tokenVerification, KycRouter);
app.use("/api/v1/plans", plansRoute);
app.use("/api/v1/transaction", transactionRoute);
app.use("/api/v1/settings", tokenVerification, SettingsRoute);

//stripe payment api

const { STRIPE_KEY } = process.env;
import Stripe from "stripe";
import featureRouter from "./Routes/UserFeatureRoute.js";
import {
	addUser,
	disconnectUser,
	fetchInAppMessages,
	joinInAppChat,
	saveInAppMessage,
	saveMessage,
} from "./Controllers/UserChatController.js";
import { sendNotification } from "./Config/utils.js";
import SettingsRoute from "./Routes/SettingsRoute.js";
import User from "./Models/UserModal.js";
import Plans from "./Models/PlanModal.js";
import Transaction from "./Models/TransactionModal.js";
import publicUserRouter from "./Routes/PublicUserRoutes.js";
import KYCDetails from "./Models/KYCDetailModal.js";
import { getCheckResult } from "./Controllers/KycController.js";

const stripe = Stripe(STRIPE_KEY);

const calculateOrderAmount = items => {
	// Replace this constant with a calculation of the order's amount
	// Calculate the order total on the server to prevent
	// people from directly manipulating the amount on the client
	return items * 100;
};

app.post("/api/v1/create-payment-intent-customers", async (req, res) => {
	let custId = 0;
	const email = req.query.email;
	const name = req.query.name;
	const phone = req.query.phone;
	const des = req.query.des;
	const total = req.query.total;
	const currency = req.query.currency;
	const invoiceId = req.query.invoiceId;
	const stdes = req.query.stdes;

	const customers = await stripe.customers.search({
		query: `email:\'${email}\'`,
	});

	if (customers.data.length > 0) {
		custId = customers.data[0].id;
	} else {
		const customerc = await stripe.customers.create({
			name: name,
			email: email,
			phone: phone,
			description: des,
		});
		custId = customerc.id;
	}

	const paymentIntent = await stripe.paymentIntents.create({
		amount: calculateOrderAmount(total),
		currency: currency,
		customer: custId,
		description: "Invoice " + invoiceId,
		statement_descriptor: stdes,
	});

	res.send({
		clientSecret: paymentIntent.client_secret,
	});
});

app.post("/api/v1/stripe/create-customer/:userId", async (req, res) => {
	let custId = 0;

	const { userId } = req.params;

	const user = await User.findById(userId);

	if (!user) {
		return res.status(400).send({ error: "User not found." });
	}

	const customers = await stripe.customers.search({
		query: `email:\'${user?.email}\'`,
	});

	if (customers.data.length > 0) {
		custId = customers.data[0].id;
	} else {
		const customerc = await stripe.customers.create({
			name: user?.name,
			email: user?.email,
			phone: user?.phone,
			description: "",
		});
		custId = customerc.id;
	}

	res.send({
		customerId: custId,
	});
});

app.post("/api/v1/stripe/create-subscription/:userId", async (req, res) => {
	try {
		let custId = 0;

		const { userId } = req.params;
		const { isRenew, planId, coupons, isCouponApplied, migrationPlanId } =
			req.body;

		const user = await User.findById(userId);

		if (!user) {
			return res.status(400).send({ error: "User not found." });
		}

		if (!planId) {
			return res.status(400).send("Invalid plan!");
		}

		if (!user?.customerId) {
			const customers = await stripe.customers.search({
				query: `email:\'${user?.email}\'`,
			});

			if (customers.data.length > 0) {
				custId = customers.data[0].id;
			} else {
				const customerc = await stripe.customers.create({
					name: user?.name,
					email: user?.email,
					phone: user?.phone,
					description: "",
					// TODO: add addresses of users
				});
				await User.findByIdAndUpdate(user?._id, {
					customerId: customerc.id,
				});
				custId = customerc.id;
			}
		} else {
			custId = user?.customerId;
		}

		let subscriptionPayload = {
			customer: custId,
			items: [],
			payment_behavior: "default_incomplete",
			payment_settings: {
				save_default_payment_method: "on_subscription",
			},
			expand: ["latest_invoice.payment_intent"],
		};

		let plan = await Plans.findById(planId);

		let migrationPlan;

		if (migrationPlanId) {
			migrationPlan = await Plans.findById(migrationPlanId);
		}

		if (!plan?._id) {
			return res.status(400).send("Invalid plan!");
		}

		subscriptionPayload.items = [
			...subscriptionPayload.items,
			{
				price: plan?.priceId,
			},
		];

		if (!isRenew) {
			const membershipFreePlan = await Plans.findOne({
				slug: "free",
				isEnabled: true,
			});
			subscriptionPayload.add_invoice_items = [
				{
					price: membershipFreePlan?.priceId,
				},
			];
		}

		if (coupons > 0) {
			subscriptionPayload.add_invoice_items = [
				...(subscriptionPayload?.add_invoice_items || []),
				{
					price: "price_1OSdaWIY2iRgjDNndQaGlN1j",
					quantity: coupons,
				},
			];
		}

		if (migrationPlan) {
			subscriptionPayload.add_invoice_items = [
				...subscriptionPayload.add_invoice_items,
				{
					price: migrationPlan?.priceId,
				},
			];
		}

		if (isCouponApplied) {
			subscriptionPayload.coupon = "NNujBjUr";
		}

		const subscription =
			await stripe.subscriptions.create(subscriptionPayload);
		console.log(subscription?.latest_invoice?.lines);

		res.send({
			subscriptionId: subscription.id,
			clientSecrets: [
				subscription.latest_invoice.payment_intent.client_secret,
			],
			planId: plan?._id,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).send("Internal server error");
	}
});

app.post("/api/v1/stripe/subscribe-membership", async (req, res) => {
	try {
		const {
			userId,
			planId,
			amount,
			currency,
			days,
			transactionId,
			subscriptionId,
			isRenew,
			type,
		} = req.body;

		const user = await User.findById(userId);

		if (!user) {
			return res.status(400).send({ error: "User not found." });
		}

		const transactionKyc = await Transaction.create({
			userId: userId,
			planId: req.body.planId,
			type: req.body?.type,
			amount: req.body.amount,
			currency: currency,
			status: "paid",
			transactionId,
		});
		const membershipFreePlan = await Plans.findOne({
			slug: "free",
			isEnabled: true,
		});
		let transactionMemberShip = {};
		let subscriptionDetail = "";
		if (membershipFreePlan && !isRenew) {
			const transactions = await Transaction.create({
				userId: userId,
				transactionId,
				planId: membershipFreePlan?._id,
				amount: 0,
				currency: currency,
				type: "membership",
				status: "paid",
			});

			const expiryDateMembership = new Date();
			const startDateMembership = new Date();

			expiryDateMembership.setDate(
				expiryDateMembership.getDate() +
				parseInt(membershipFreePlan.days ?? 0),
			);
			subscriptionDetail = {
				planId: membershipFreePlan._id,
				amount: 0,
				currency,
				days: membershipFreePlan.days,
				expiryDate: expiryDateMembership,
				startDate: startDateMembership,
				purchaseDate: new Date(),
				transactionId: transactions?._id,
			};
		}

		let transactionMigration;
		if (req.body.migrationPlanId) {
			transactionMigration = await Transaction.create({
				userId: userId,
				planId: req.body.migrationPlanId,
				type: "migration",
				amount: req.body.migrationAmount,
				currency: "$",
				status: "paid",
				transactionId,
			});
		}

		const expiryDate = new Date();
		const startDate = new Date();

		expiryDate.setDate(expiryDate.getDate() + days);
		const kycDetail = {
			planId,
			amount,
			currency,
			days,
			expiryDate,
			startDate,
			purchaseDate: new Date(),
			transactionId: transactionKyc?._id,
			subscriptionId,
		};
		if (subscriptionDetail) {
			await User.findByIdAndUpdate(
				userId,
				{
					$push: { subscription: subscriptionDetail },
					isMemberShipCancelled: false,
				},
				{ new: true },
			);
		}
		if (req.body.migrationPlanId) {
			const migrationDetails = {
				planId: req.body.migrationPlanId,
				amount: req.body.migrationAmount,
				transactionId: transactionMigration._id,
				currency: "$",
				purchaseDate: new Date(),
				startDate: new Date(),
			};

			await User.updateOne(
				{ _id: userId },
				{
					migration: migrationDetails,
				},
			);
		}
		if (type === "kyc") {
			const updatedUser = await User.findByIdAndUpdate(
				userId,
				{
					$push: { kyc: kycDetail },
					isKycCancelled: false,
				},
				{ new: true },
			);
			return res.json(updatedUser);
		} else {
			const updatedUser = await User.findByIdAndUpdate(
				userId,
				{
					$push: { subscription: kycDetail },
					isMemberShipCancelled: false,
				},
				{ new: true },
			);
			return res.json(updatedUser);
		}
	} catch (error) {
		console.log(error);
		return res.status(500).send("Internal Server Error!");
	}
});

const handleSuccessfulPayment = async payment => {
	try {
		const user = await User.findOne({ customerId: payment?.customer });
		if (!user?._id) {
			return false;
		}

		const planDetails = await Plans.findOne({
			priceId: payment?.lines?.data?.[0]?.plan?.id,
		});
		if (!planDetails?._id) {
			return false;
		}
		const days = planDetails?.days || 0;

		const transactionKyc = await Transaction.create({
			userId: user?._id,
			planId: planDetails?._id,
			type: planDetails?.type,
			amount: payment?.amount_paid,
			currency: payment?.currency,
			status: "paid",
			transactionId: payment?.payment_intent,
		});

		const expiryDate = new Date();
		const startDate = new Date();

		expiryDate.setDate(expiryDate.getDate() + days);
		const kycDetail = {
			planId: planDetails?._id,
			amount: payment?.amount_paid,
			currency: payment?.currency,
			days,
			expiryDate,
			startDate,
			purchaseDate: new Date(),
			transactionId: transactionKyc?._id,
			subscriptionId: payment?.subscription,
		};

		if (planDetails?.type == "kyc") {
			const updatedUser = await User.findByIdAndUpdate(
				user?._id,
				{
					$push: { kyc: kycDetail },
					isKycCancelled: false,
				},
				{ new: true },
			);
		} else if (planDetails?.type === "membership") {
			await User.findByIdAndUpdate(
				user?._id,
				{
					$push: { subscription: kycDetail },
					isMemberShipCancelled: false,
				},
				{ new: true },
			);
		}
	} catch (error) {
		console.log(error);
	}
};

app.post("/api/v1/stripe/webhook", async (request, response) => {
	const event = request.body;

	// Handle the event
	switch (event.type) {
		case "invoice.payment_succeeded":
			const payment = event.data.object;
			if (payment?.billing_reason === "subscription_cycle") {
				handleSuccessfulPayment(payment);
			}
			break;
		default:
			console.log(`Unhandled event type ${event.type}`);
	}

	// Return a response to acknowledge receipt of the event
	response.json({ received: true });
});

app.post("/webhook", bodyParser.json(), async (request, response) => {
	try {
		const signature = request.headers["complycube-signature"];
		const { body } = request;
		const event = eventVerifier.constructEvent(JSON.stringify(body), signature);

		const checkId = event.payload.id;
		const clientIdCome = event.payload.clientId;


		const kycDetail = await KYCDetails.findOne({
			$or: [{ checkId }, { documentCheckId: checkId }],
		}).exec();

		switch (event.type) {
			case "check.completed": {

				const checkOutCome = event.payload.outcome;

				const userId = await User.findOne({ complyUserId: clientIdCome });
				console.log("The checkOutCome is: ", checkOutCome);

				const checkResults = await complycube.check.get(checkId);

				if (checkOutCome === "clear") {
					console.log("checkouit come is clear now");

					if (checkResults.type === "document_check") {

						await updateKYCDetails(userId, { documentCheckResult: checkResults.outcome });

					} else if (checkResults.type === "identity_check") {

						await updateKYCDetails(userId, { identityCheckResult: checkResults.outcome });

					}

					const userkycDetail = await KYCDetails.findOne({
						userId,
						documentCheckResult: "clear",
						identityCheckResult: "clear",
					});

					if (userkycDetail) {
						await updateUserKYCStatus(userId, true);
					} else {
						console.log("user with 2 clear checks not found!");
					}
				} else if (checkOutCome === "attention") {
					if (checkResults.type === "identity_check") {
						await updateUserKYCStatus(userId, false);
					} else if (checkResults.type === "document_check") {
						const { contentAnalysis, blackListCheck } = checkResults.outcome.breakdown;

						if (contentAnalysis.expirationDate === "attention") {
							console.log("The document is expired");
							await updateUserKYCStatus(userId, false);
						}

						if (blackListCheck === "attention") {
							await User.updateOne({ _id: kycDetail.userId }, { isKycFailed: true });
						}
					}
				}
				break;
			}
			case "check.pending":
				console.log(`Check ${checkId} is pending`);
				break;
			default:
				return response.status(400).end();
		}

		response.json({ received: true });
	} catch (error) {
		console.error("Webhook Error: ", error.message);
		response.status(400).send(`Webhook Error: ${error.message}`);
	}
});

async function updateKYCDetails(userId, update) {
	await KYCDetails.updateOne({ userId }, update);
}

async function updateUserKYCStatus(userId, status) {
	await User.updateOne({ _id: userId }, { isKycCompleted: status });
}

app.use((err, req, res, next) => {
	if (res.headersSent) return next(err);
	res.status(400).json({ message: err.message });
});

// Socket.io setup for real-time messaging
io.on("connection", socket => {
	// console.log('User connected:', socket.id);

	socket.on("join-in-app-chat", async ({ receiverId, userId }, callback) => {
		console.log("User connected to in app chat id : ", socket.id);
		const chat = await joinInAppChat({
			id: socket.id,
			userId,
			receiverId,
		});
		// console.log(chat, chat?._id, ' <=== I am chat in response of join...')
		socket.join(chat?._id?.toString());
		callback(chat);
	});

	socket.on(
		"sendMessage-in-app-chat",
		async ({ message, senderId, receiverId }, callback) => {
			console.log(
				message,
				senderId,
				receiverId,
				" <=== sender and receiver iddd.....",
			);
			const chat = await saveInAppMessage(
				socket.id,
				senderId,
				receiverId,
				message,
			);
			if (!chat) {
				callback();
				return;
			}
			io.to(chat?._id?.toString()).emit(
				"allMessages-in-app",
				await fetchInAppMessages(senderId),
			);
			sendNotification(
				senderId,
				receiverId,
				"CHAT",
				"New message",
				"You received new message in chat",
			);

			callback();
		},
	);

	socket.on("fetch-all-in-app-messages", async ({ userId }, callback) => {
		callback(await fetchInAppMessages(userId));
	});

	socket.on("join", async ({ alarmId, memberId }, callback) => {
		console.log("User connected to group : ", socket.id);
		const { error, user, chat, members } = await addUser({
			id: socket.id,
			alarmId,
			memberId,
		});

		if (error) return callback({ error: error });

		socket.join(user.alarmId);
		// io.to(user.alarmId).emit('loadChat', chat)
		io.to(user.alarmId).emit("message", {
			name: "admin",
			message: `${user.name} has joined the group.`,
		});

		io.to(user.alarmId).emit("memberUpdated", members);

		callback(chat);
	});

	socket.on(
		"sendMessage",
		async ({ message, alarmId, memberId }, callback) => {
			const chats = await saveMessage(
				socket.id,
				alarmId,
				memberId,
				message,
			);
			if (!chats) {
				callback();
				return;
			}
			console.log(chats, " <=== I am chats...");
			io.to(alarmId).emit("allMessages", chats);

			callback();
		},
	);

	socket.on("disconnect", async () => {
		console.log(
			"disconnected user with id ",
			socket.id,
			" <==== user disconnected...",
		);
		const { member, onlineMembers, alarmId } = await disconnectUser(
			socket.id,
		);
		if (alarmId) {
			io.to(alarmId).emit("memberUpdated", onlineMembers);
			io.to(alarmId).emit("message", {
				name: "admin",
				message: `${member.name} has left the group.`,
			});
		}
	});
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () =>
	console.log(`server running on port http://localhost:${PORT}`),
);

export default app;
