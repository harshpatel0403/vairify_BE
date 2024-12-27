import customId from "custom-id";
import mongoose from "mongoose";
import Transaction from "../Models/TransactionModal.js";
import PlanModal from "../Models/PlanModal.js";
import User from "../Models/UserModal.js";

function addDaysToDate(date, daysToAdd) {
	var newDate = new Date(date);
	newDate.setDate(newDate.getDate() + daysToAdd);
	return newDate;
  }

export const paySubscription = async (req, res) => {
	try {
		const transactionIdKyc = customId({});
		const kycPlan = await PlanModal.findOne({
			_id: req.body.planId,
		});
		const transactionKyc = await Transaction.create({
			userId: req.body.userId,
			planId: req.body.planId,
			type: "kyc",
			amount: req.body.amount,
			currency: "$",
			status: "paid",
			transactionId: transactionIdKyc,
		});
		const membershipFreePlan = await PlanModal.findOne({
			slug: 'free',
			isEnabled: true
		});
		const { userId, planId, amount, currency, days } = req.body;
		let transactionMemberShip = {};
		let subscriptionDetail = '';
		if(membershipFreePlan){
			const transactionIdMemberShip = customId({});
			transactionMemberShip = await Transaction.create({
				userId: req.body.userId,
				planId: membershipFreePlan._id,
				type: "membership",
				amount: req.body.amount,
				currency: "$",
				status: "paid",
				transactionId: transactionIdMemberShip,
			});
			
			const expiryDateMembership = new Date();
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
				purchaseDate: new Date(),
			};
		}
		
		const expiryDate = new Date();
		expiryDate.setDate(expiryDate.getDate() + days);
		const kycDetail = {
			planId,
			amount,
			currency,
			days,
			expiryDate,
			purchaseDate: new Date(),
		};
		if(subscriptionDetail){
			await User.findByIdAndUpdate(
				userId,
				{
					$push: { subscription: subscriptionDetail },
				},
				{ new: true },
			);
		}
		const updatedUser = await User.findByIdAndUpdate(
			userId,
			{
				$push: { kyc: kycDetail },
			},
			{ new: true },
		);

		res.status(201).json({
			status: "success",
			data: { transactionKyc, transactionMemberShip, user: updatedUser },
		});
	} catch (error) {
		console.log("error---", error);
		res.status(500).json({
			status: "fail",
			message: "An error occurred while creating transaction",
		});
	}
};

export const renewMembershipPlan = async (req, res) => {
	try {
		const userDetail = await User.findOne({_id: req.body.userId});
		let expiryDateMembership = new Date();
		let startDateMembership = new Date();
		const { userId, planId, amount, currency, days } = req.body;
		expiryDateMembership.setDate(
			expiryDateMembership.getDate() +
				parseInt(days ?? 0),
		);
		let subscriptionDetail = {
			planId,
			amount,
			currency,
			days,
			expiryDate: expiryDateMembership,
			purchaseDate: new Date(),
			startDate: startDateMembership,
		};
		if(userDetail && userDetail.subscription && userDetail.subscription.length > 0){
			startDateMembership = userDetail.subscription[userDetail.subscription.length - 1].expiryDate;
			startDateMembership.setDate(
				userDetail.subscription[userDetail.subscription.length - 1].expiryDate.getDate() + 1,
			);
			subscriptionDetail = {
				...subscriptionDetail,
				startDate: startDateMembership,
			}
			subscriptionDetail = {
				...subscriptionDetail,
				expiryDate: addDaysToDate(userDetail.subscription[userDetail.subscription.length - 1].expiryDate, 1 + parseInt(days ?? 0)),
			}
		}
		const membershipPlan = await PlanModal.findOne({
			_id: req.body.planId,
		});
		const transactionIdMemberShip = customId({});
		const transactionMemberShip = await Transaction.create({
			userId: req.body.userId,
			planId: req.body.planId,
			type: "membership",
			amount: req.body.amount,
			currency: "$",
			status: "paid",
			transactionId: transactionIdMemberShip,
		});

		const updatedUser = await User.findByIdAndUpdate(
			userId,
			{
				$push: { subscription: subscriptionDetail },
			},
			{ new: true },
		);
		res.status(201).json({
			status: "success",
			data: { transactionMemberShip, user: updatedUser },
		});
	} catch (error) {
		console.log("error---", error);
		res.status(500).json({
			status: "fail",
			message: "An error occurred while creating transaction",
		});
	}
};

export const renewKycPlan = async (req, res) => {
	try {
		const kycPlan = await PlanModal.findOne({ _id: req.body.planId });
		const userDetail = await User.findOne({_id: req.body.userId});
		const { userId, planId, amount, currency, days } = req.body;
		let expiryDate = new Date();
		let startDate = new Date();
		expiryDate.setDate(expiryDate.getDate() + days);
		let kycDetail = {
			planId,
			amount,
			currency,
			days,
			expiryDate,
			purchaseDate: new Date(),
			startDate,
		};
		if(userDetail && userDetail.kyc && userDetail.kyc.length > 0){
			startDate = userDetail.kyc[userDetail.kyc.length - 1].expiryDate;
			startDate.setDate(
				userDetail.kyc[userDetail.kyc.length - 1].expiryDate.getDate() + 1,
			);
			kycDetail = {
				...kycDetail,
				startDate: startDate,
			}
			kycDetail = {
				...kycDetail,
				expiryDate: addDaysToDate(userDetail.kyc[userDetail.kyc.length - 1].expiryDate, 1 + parseInt(days ?? 0)),
			}
		}
		const transactionIdKyc = customId({});
		const transactionKyc = await Transaction.create({
			userId: req.body.userId,
			planId: req.body.planId,
			type: "kyc",
			amount: req.body.amount,
			currency: "$",
			status: "paid",
			transactionId: transactionIdKyc,
		});

		const updatedUser = await User.findByIdAndUpdate(
			userId,
			{
				$push: { kyc: kycDetail },
			},
			{ new: true },
		);
		res.status(201).json({
			status: "success",
			data: { transactionKyc, user: updatedUser },
		});
	} catch (error) {
		console.log("error---", error);
		res.status(500).json({
			status: "fail",
			message: "An error occurred while creating transaction",
		});
	}
};

export const getTransactions = async (req, res) => {
	try {
		const transactions = await Transaction.find();
		res.status(200).json({ status: "success", data: transactions });
	} catch (error) {
		res.status(500).json({
			status: "error",
			message: "An error occurred while fetching transactions",
		});
	}
};

export const createTransactions = async (req, res) => {
	try {
		const transactions = new Transaction({
			...req?.body
		});
		await transactions.save()
		res.status(200).json({ status: "success", data: transactions });
	} catch (error) {
		console.log(error)
		res.status(500).json({
			status: "error",
			message: "An error occurred while fetching transactions",
		});
	}
};
export const getTransactionsByUserId = async (req, res) => {
	const { userId } = req.params;

	try {
		// const transactions = await Transaction.find({ userId });
		const transactions = await Transaction.aggregate([
			{ $lookup: { from: "plans", localField: "planId", foreignField: "_id", as: "planData" } },
			{ "$unwind": { "path": "$planData", "preserveNullAndEmptyArrays": true } },
			{ "$match": { userId: new mongoose.Types.ObjectId(userId) } },
			{
			  $project: {
				_id: "$_id",
				transactionId: "$transactionId",
				amount: "$amount",
				currency: "$currency",
				type: "$type",
				status: "$status",
				planData: "$planData",
				createdAt: "$createdAt"
			  }
			}
		  ]);
		res.status(200).json({ status: "success", data: transactions });
	} catch (error) {
		console.log("error--",error)
		res.status(500).json({
			status: "error",
			message:
				"An error occurred while fetching transactions for the user",
		});
	}
};

export const getTransactionById = async (req, res) => {
	const { transactionId } = req.params;

	try {
		const transaction = await Transaction.findById(transactionId);
		if (!transaction) {
			return res
				.status(404)
				.json({ status: "fail", message: "Transaction not found" });
		}
		res.status(200).json({ status: "success", data: transaction });
	} catch (error) {
		res.status(500).json({
			status: "error",
			message: "An error occurred while fetching the transaction",
		});
	}
};
