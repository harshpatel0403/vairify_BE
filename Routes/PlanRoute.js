import express from "express";
import {
	getPlanById,
	getKycPlanByUserType,
	getMemberShipPlanByUserType,
	getMigrationPlanByUserType
} from "../Controllers/PlansController.js";

const plansRoute = express.Router();
plansRoute.get("/getKycPlanByUserType", getKycPlanByUserType);
plansRoute.get("/getMemberShipPlanByUserType", getMemberShipPlanByUserType);
plansRoute.get("/getMigrationPlanByUserType", getMigrationPlanByUserType);
plansRoute.get("/:planId", getPlanById);

export default plansRoute;
