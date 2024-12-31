import moment from "moment";
import Payment from "../Models/UserVaripays.js";
import { uploadToS3 } from "../utils/awsS3Functions.js";

export const getUserVaripays = async (req, res) => {
	const { userId } = req.params;

	try {
		const userVaripay = await Payment.findOne({ userId });

		if (!userVaripay) {
			return res
				.status(200)
				.json([{ message: "User payment information not found." }]);
		}

		const paymentApps = userVaripay.paymentApp;

		return res.json(paymentApps);
	} catch (error) {
		console.error(error);
		res.status(500).json(error);
	}
};

export const addPaymentInfo = async (req, res) => {
	try {
		const data = req.fields;
		const file = req.files;
		var image = "";
		if (file) {
			const folderName = "user_varipays";
			await uploadToS3(folderName, file.buffer, file.filename.filename, file.filename.mimetype)
				.then(url => {
					console.log('File uploaded successfully in Varipay controller:', url);
					image = url;
				})
				.catch(err => console.error('Error uploading file in Varipay controller:', err));
		}

		const filter = { userId: data.userId };
		const update = {
			$push: {
				paymentApp: {
					paymentAppName: data.paymentAppName,
					paymentLink: data.paymentLink,
					qrCode: image,
					paymentImage: data.paymentImage,
				},
			},
		};

		const updatedUserVaripay = await Payment.findOneAndUpdate(
			filter,
			update,
			{
				new: true,
				upsert: true, // Create a new document if it doesn't exist
			},
		);

		if (!updatedUserVaripay) {
			return res
				.status(200)
				.json([{ message: "User payment information not found." }]);
		}

		return res.json({
			message: "User payment information added successfully.",
		});
	} catch (error) {
		console.error(error);
		res.status(500).json(error);
	}
};

export const compareVaripayPaymentMethods = async (req, res) => {
	try {
		const { user1Id, user2Id } = req.params;
		const user1Varipay = await Payment.findOne({ userId: user1Id });
		const user2Varipay = await Payment.findOne({ userId: user2Id });

		if (!user1Varipay || !user2Varipay) {
			return res.status(200).json([]);
		}

		const user1PaymentApps = user1Varipay?.paymentApp;
		const user2PaymentApps = user2Varipay?.paymentApp;

		console.log("user1PaymentApps: ", user1PaymentApps);
		console.log("user2PaymentApps: ", user2PaymentApps);

		const commonPaymentMethods = user2PaymentApps.filter(app1 =>
			user1PaymentApps.some(
				app2 => app1.paymentAppName === app2.paymentAppName,
			),
		);

		if (commonPaymentMethods.length > 0) {
			return res.status(200).json(commonPaymentMethods);
		} else {
			return res.status(200).json([]);
		}
	} catch (error) {
		console.error("Error comparing payment methods:", error);
		return res.status(500).json({ error: "Internal Server Error" });
	}
};
