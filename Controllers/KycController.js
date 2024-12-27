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
		const { clientId, type, classification, userId } = req.body;

		const requestData = JSON.stringify({
			clientId: clientId,
			type: type,
			classification: classification,
		});

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
					},
				);
			} else {
				const newKYCDetails = new KYCDetails({
					userId: userId,
					isDocIdGenerated: true,
					documentId: response.data.id,
					type,
				});
				await newKYCDetails.save();
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
				const imageData = Buffer.from(
					imageDataResponse.data.data,
					"base64",
				);

				// Save the image data to the local file
				const timestamp = Date.now();
				const filename = `livePhoto_${timestamp}.jpg`;
				if (
					!fs.existsSync(
						path.join(__dirname, "../", `/public/userKycImages/`),
					)
				) {
					fs.mkdirSync(
						path.join(__dirname, "../", `/public/userKycImages/`),
					);
				}
				const filePath = path.join(
					__dirname,
					"../",
					`/public/userKycImages/${filename}`,
				);

				fs.writeFileSync(filePath, imageData);

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
				const userDetails = await User.findOne({ _id: userId });

				if (type === "document_check") {
					await KYCDetails.updateOne(
						{ userId },
						{
							isCheckDone: true,
							documentCheckId: response.data.id,
						},
					);
				} else {
					await KYCDetails.updateOne(
						{ userId },
						{ isCheckDone: true, checkId: response.data.id },
					);
				}

				console.log(
					"the defauult user checkout is: ",
					userDetails.checkCount,
				);
				await User.updateOne(
					{ userId },
					{ checkCount: userDetails.checkCount + 1 },
				);
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
			const response = await axios(config);
			// await User.updateOne({ _id: userId }, { isKycCompleted: true });
			// const kycDetail = await KYCDetails.findOne({ userId });
			// if (kycDetail) {
			// 	await KYCDetails.updateOne(
			// 		{ userId },
			// 		{
			// 			isKycCompleted: true,
			// 			checkResult: JSON.stringify(response.data),
			// 		},
			// 	);
			// }
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
