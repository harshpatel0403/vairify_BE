import axios from "axios";
import User from "../Models/UserModal.js";
import KYCDetails from "../Models/KYCDetailModal.js";
import path, { dirname } from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const AddDoc = async (req, res) => {
	try {
		const {
			clientId,
			type,
			classification,
			issuingCountry,
			userId,
		} = req.body;
		if (!clientId || !type || !classification || !issuingCountry || !userId) {
			return res.status(400).json({
				error: " clientId,type,classification,issuingCountry and userId are required",
			});
		}

		const requestData = JSON.stringify({
			clientId: clientId,
			type: type,
			classification: classification,
			issuingCountry: issuingCountry,
		});
		console.log("Request payload for ComplyCube API:", requestData);

		const config = {
			method: "post",
			maxBodyLength: Infinity,
			url: `https://api.complycube.com/v1/documents`,
			headers: {
				"Content-Type": "application/json",
				Authorization: process.env.COMPLYCUBE_API_TOKEN,
			},
			data: requestData,
		};

		try {
			const response = await axios(config);
			const kycDetail = await KYCDetails.findOne({ userId });
			if (kycDetail) {
				await KYCDetails.updateOne(
					{ userId },
					{
						isDocIdGenerated: true,
						documentId: response.data.id,
						type,
						classification,
						issuingCountry,
					},
				);
				console.log("Updated KYC details in database");
			} else {
				const newKYCDetails = new KYCDetails({
					userId: userId,
					isDocIdGenerated: true,
					documentId: response.data.id,
					type,
					classification,
					issuingCountry,
				});
				await newKYCDetails.save();
				console.log("Saved new KYC details in database");
			}
			res.status(200).json(response.data);
		} catch (error) {
			console.error(error);
			// res.status(500).send("Error uploading to ComplyCube");
			console.error(
				"Error uploading to ComplyCube:",
				error.response?.data || error.message,
			);
		}
	} catch (error) {
		console.error(error);
		res.status(400).send("Bad request");
	}
};

export const UploadFrontDoc = async (req, res) => {
	try {
		const { fileName, data, docId, userId } = req.body;

		const requestData = JSON.stringify({
			fileName: fileName,
			data: data,
		});
		const config = {
			method: "post",
			maxBodyLength: Infinity,
			url: `https://api.complycube.com/v1/documents/${docId}/upload/front`,
			headers: {
				"Content-Type": "application/json",
				Authorization: process.env.COMPLYCUBE_API_TOKEN,
			},
			data: requestData,
		};

		try {
			const response = await axios(config);
			const kycDetail = await KYCDetails.findOne({ userId });
			if (kycDetail) {
				await KYCDetails.updateOne(
					{ userId },
					{
						isFrontPhotoUploaded: true,
						frontDocId: response.data.id,
						frontDocUrl: response.data.downloadLink,
					},
				);
			}
			res.status(200).json(response.data);
		} catch (error) {
			res.status(500).send(
				`Error uploading to ComplyCube. ${error.response.data.message}`,
			);
		}
	} catch (error) {
		res.status(400).send("Bad request");
	}
};

export const UploadBackDoc = async (req, res) => {
	try {
		const { fileName, data, docId, userId } = req.body;

		const requestData = JSON.stringify({
			fileName: fileName,
			data: data,
		});

		const config = {
			method: "post",
			maxBodyLength: Infinity,
			url: `https://api.complycube.com/v1/documents/${docId}/upload/back`,
			headers: {
				"Content-Type": "application/json",
				Authorization: process.env.COMPLYCUBE_API_TOKEN,
			},
			data: requestData,
		};

		try {
			const response = await axios(config);
			const kycDetail = await KYCDetails.findOne({ userId });
			if (kycDetail) {
				await KYCDetails.updateOne(
					{ userId },
					{
						isBackPhotoUploaded: true,
						backDocId: response.data.id,
						backDocUrl: response.data.downloadLink,
					},
				);
			}
			res.status(200).json(response.data);
		} catch (error) {
			res.status(500).send(
				`Error uploading to ComplyCube. ${error.response.data.message}`,
			);
		}
	} catch (error) {
		console.error(error);
		res.status(400).send("Bad request");
	}
};

export const LivePhoto = async (req, res) => {
	try {
		const { clientId, data, userId } = req.body;
		const requestData = JSON.stringify({
			clientId: clientId,
			data: data,
			performLivenessCheck: false,
		});

		const config = {
			method: "post",
			maxBodyLength: Infinity,
			url: `https://api.complycube.com/v1/livePhotos`,
			headers: {
				"Content-Type": "application/json",
				Authorization: process.env.COMPLYCUBE_API_TOKEN,
			},
			data: requestData,
		};

		try {
			const response = await axios(config);
			const kycDetail = await KYCDetails.findOne({ userId });

			if (kycDetail) {
				const downloadLink = `https://api.complycube.com/v1/${response.data.downloadLink}`;
				// Make a new request to download the photo with the appended base URL
				const downloadConfig = {
					method: "get",
					url: downloadLink,
					headers: {
						"Content-Type": "application/json",
						Authorization: process.env.COMPLYCUBE_API_TOKEN,
					},
				};

				const imageDataResponse = await axios(downloadConfig);

				// Decode base64-encoded image data
				// const imageData = Buffer.from(
				// 	imageDataResponse.data.data,
				// 	"base64",
				// );

				// Save the image data to the local file
				const timestamp = Date.now();
				const filename = `livePhoto_${timestamp}.jpg`;
				// if (
				// 	!fs.existsSync(
				// 		path.join(__dirname, "../", `/public/userKycImages/`),
				// 	)
				// ) {
				// 	fs.mkdirSync(
				// 		path.join(__dirname, "../", `/public/userKycImages/`),
				// 	);
				// }
				// const filePath = path.join(
				// 	__dirname,
				// 	"../",
				// 	`/public/userKycImages/${filename}`,
				// );

				// fs.writeFileSync(filePath, imageData);

				await KYCDetails.updateOne(
					{ userId },
					{
						isLivePhotoUploaded: true,
						livePhotoId: response.data.id,
						livePhotoUrl: response.data.downloadLink,
						livePhotoFile: filename,
					},
				);
			}

			res.status(200).json(response.data);
		} catch (error) {
			console.log(error);
			res.status(500).send(error?.response?.data?.message);
		}
	} catch (error) {
		console.log(error);
		res.status(400).send("Bad request");
	}
};

export const RunCheck = async (req, res) => {
	try {
		const { clientId, documentId, livePhotoId, type, userId } = req.body;

		if (!clientId || !documentId || !livePhotoId || !type || !userId) {
			return res.status(400).json({
				error: "livePhotoId, clientId, documentId, type and userId are required",
			});
		}
		const requestData = JSON.stringify({
			clientId: clientId,
			documentId: documentId,
			livePhotoId: livePhotoId,
			type: type,
		});

		const config = {
			method: "post",
			maxBodyLength: Infinity,
			url: `https://api.complycube.com/v1/checks`,
			headers: {
				"Content-Type": "application/json",
				Authorization: process.env.COMPLYCUBE_API_TOKEN,
			},
			data: requestData,
		};

		try {
			const response = await axios(config);
			const kycDetail = await KYCDetails.findOne({ userId });
			if (kycDetail) {

				// if (type === "document_check") {
				// 	await KYCDetails.updateOne(
				// 		{ userId },
				// 		{
				// 			isCheckDone: true,
				// 			documentCheckId: response.data.id,
				// 		},
				// 	);
				// } else {
				await KYCDetails.updateOne(
					{ userId },
					{ isCheckDone: true, checkId: response.data.id },
				);
				// }
			}
			res.status(200).json(response.data);
		} catch (error) {
			console.error(error);
			res.status(500).send("Error uploading to ComplyCube");
		}
	} catch (error) {
		console.error(error);
		res.status(400).send("Bad request");
	}
};

export const getCheckResult = async (req, res) => {
	try {
		const { checkId, userId } = req.body;

		const config = {
			method: "get",
			maxBodyLength: Infinity,
			url: `https://api.complycube.com/v1/checks/${checkId}`,
			headers: {
				"Content-Type": "application/json",
				Authorization: process.env.COMPLYCUBE_API_TOKEN,
			},
		};

		try {
			let updatedUser;
			const response = await axios(config);
			const livenessCheckScore = response?.data?.result?.breakdown?.authenticityAnalysis?.breakdown?.livenessCheckScore;
			if (response?.data?.status == "complete" && (typeof livenessCheckScore == "number" && livenessCheckScore > 30)) {

				updatedUser = await User.findOneAndUpdate(
					{ _id: userId },
					{ isKycCompleted: true },
					{ new: true } // This ensures the updated document is returned
				);

				const kycDetail = await KYCDetails.findOne({ userId });
				if (kycDetail) {
					await KYCDetails.updateOne(
						{ userId },
						{
							isKycCompleted: true,
							checkResult: JSON.stringify(response.data),
						},
					);
				}
			}
			else {
				updatedUser = await User.findOne({ _id: userId })
			}
			res.status(200).json({ kycStatus: response.data, data: updatedUser });
		} catch (error) {
			console.error(error);
			res.status(500).send("Error uploading to ComplyCube");
		}
	} catch (error) {
		console.error(error);
		res.status(400).send("Bad request");
	}
};

export const validateDocument = async (req, res) => {
	try {
		const { documentType, clientId, documentId, userId } = req.body;

		if (!documentType || !clientId || !documentId || !userId) {
			return res.status(400).json({
				error: "Image, clientId, documentId, userId and document type are required",
			});
		}

		const requestData = JSON.stringify({
			clientId: clientId,
			documentId: documentId,
			type: "document_check",
			documentType: documentType,
		});
		const validateConfig = {
			method: "post",
			maxBodyLength: Infinity,
			url: `https://api.complycube.com/v1/checks`,
			headers: {
				"Content-Type": "application/json",
				Authorization: process.env.COMPLYCUBE_API_TOKEN,
			},
			data: requestData,
		};
		try {
			const updatedUser = await User.findByIdAndUpdate(
				userId,
				{ $inc: { checkCount: 1 } },
				{ new: true, useFindAndModify: false }
			);
			const validateResponse = await axios(validateConfig);

			const kycDetail = await KYCDetails.findOne({ userId });
			if (kycDetail) {
				const userDetails = await User.findOne({ _id: userId });
				console.log(validateResponse, "kyc and user ")

				await KYCDetails.updateOne(
					{ userId },
					{
						isCheckDone: true,
						documentCheckId: validateResponse.data.id,
					}, []
				);
			}
			res.status(200).json(validateResponse.data);
		} catch (error) {
			console.error(error);
			res.status(500).send("Error uploading to ComplyCube");
		}
	} catch (error) {
		console.error(
			"Error validating document:",
			error.response?.data || error.message,
		);
	}
};


export const DocCheckstatus = async (req, res) => {
	try {
		const { documentCheckId } = req.query;
		if (!documentCheckId) {
			throw new Error("Invalid response: Missing documentId");
		}
		const configGetResult = {
			method: "get",
			maxBodyLength: Infinity,
			url: `https://api.complycube.com/v1/checks/${documentCheckId}`,
			headers: {
				Authorization: process.env.COMPLYCUBE_API_TOKEN,
			},
		};
		try {
			const response = await axios(configGetResult);
			res.status(200).json(response.data);
		} catch (error) {
			console.error(error.response ? error.response.data : error.message);
			res.status(500).send("Error ComplyCube Front Document Status");
		}
	} catch (error) {
		console.error(error);
		res.status(400).send("Bad request");
	}
};