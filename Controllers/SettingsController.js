import Appointment from "../Models/AppointmentModal.js";
import User from "../Models/UserModal.js";

export const setPushNotification = async (req, res) => {
	try {
		const userId = req?.user?._id;
		const { status } = req?.body;
		if (!userId || status === undefined || status === null) {
			return res.status(400).json({ error: "Invalid request body!" });
		}
		const user = await User.findById(userId);
		if (!user?._id) {
			return res.status(400).json({ error: "User not found!" });
		}
		const updatedUser = await User.findByIdAndUpdate(userId, {
			pushNotification: status,
		});
		return res.status(200).json(updatedUser);
	} catch (error) {
		console.error(error);
		return res.status(500).json({ error: "Internal Server Error" });
	}
};

export const getPushNotification = async (req, res) => {
	try {
		const userId = req?.user?._id;
		const { status } = req?.body;
		if (!userId || status === undefined || status === null) {
			return res.status(400).json({ error: "Invalid request body!" });
		}
		const user = await User.findById(userId);
		if (!user?._id) {
			return res.status(400).json({ error: "User not found!" });
		}
		return res
			.status(200)
			.json({ pushNotification: user?.pushNotification });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ error: "Internal Server Error" });
	}
};

export const getDateHistory = async (req, res) => {
	console.log(req?.user?._id);
	try {
		const userId = req?.user?._id;
		if (!userId) {
			return res.status(400).json({ error: "Invalid request body!" });
		}
		const user = await User.findById(userId);
		if (!user?._id) {
			return res.status(400).json({ error: "User not found!" });
		}
		const currentDate = new Date();
		const appointments = await Appointment.find({
			$or: [{ clientId: userId }],
			clientStatus: "Scheduled",
			companionStatus: "Scheduled",
			startDateTime: { $lte: currentDate },
		})
			.populate("clientId")
			.populate("companionId")
			.sort({ createdAt: -1 });

		return res.status(200).json(appointments);
	} catch (error) {
		console.error(error);
		return res.status(500).json({ error: "Internal Server Error" });
	}
};
