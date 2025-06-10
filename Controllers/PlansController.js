import Plans from "../Models/PlanModal.js";

export const getKycPlanByUserType = async (req, res) => {
	try {
		console.log("req.query.userType---", req.query.userType);
		const plans = await Plans.find({
			userType: req.query.userType,
			type: "kyc",
			slug: "paid",
			isEnabled: true,
		});
		res.status(200).json({ status: "success", data: plans });
	} catch (error) {
		res.status(500).json({
			status: "error",
			message: "An error occurred while finding plan",
		});
	}
};

export const getMemberShipPlanByUserType = async (req, res) => {
	try {
		const plans = await Plans.find({
			userType: req.query.userType,
			type: "membership",
			slug: "paid",
			isEnabled: true,
		});
		res.status(200).json({ status: "success", data: plans });
	} catch (error) {
		res.status(500).json({
			status: "error",
			message: "An error occurred while finding plan",
		});
	}
};

export const getMigrationPlanByUserType = async (req, res) => {
	try {
		const plans = await Plans.find({
			userType: req.query.userType,
			type: "migration",
			slug: "paid",
			isEnabled: true,
		});
		res.status(200).json({ status: "success", data: plans });
	} catch (error) {
		res.status(500).json({
			status: "error",
			message: "An error occurred while finding plan",
		});
	}
};

export const getPlanById = async (req, res) => {
	const { planId } = req.params;

	try {
		const plan = await Plans.findOne({
			_id: planId,
			deleted: { $ne: true },
		});
		if (!plan) {
			return res
				.status(404)
				.json({ status: "fail", message: "Plan not found" });
		}
		res.status(200).json({ status: "success", data: plan });
	} catch (error) {
		res.status(500).json({
			status: "error",
			message: "An error occurred while finding plan",
		});
	}
};
