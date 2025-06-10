import express from "express";
import {
	paySubscription,
	getTransactions,
	getTransactionById,
	getTransactionsByUserId,
	renewMembershipPlan,
	renewKycPlan,
	createTransactions
} from "../Controllers/TransactionController.js";

const transactionRoute = express.Router();

transactionRoute.post("/create", createTransactions);
transactionRoute.post("/pay_subscription", paySubscription);
transactionRoute.post("/renew_membership_plan", renewMembershipPlan);
transactionRoute.post("/renew_kyc_plan", renewKycPlan);
transactionRoute.get("/transactions", getTransactions);
transactionRoute.get("/transactions/:transactionId", getTransactionById);
transactionRoute.get("/getUserTransactions/:userId", getTransactionsByUserId);

export default transactionRoute;
