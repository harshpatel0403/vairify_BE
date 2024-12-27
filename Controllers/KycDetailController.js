import moment from "moment";
import KYCDetails from "../Models/KYCDetailModal.js";

export const handleKYCCallback = async (req, res) => {
  try {
    const userId = req.body.userId;
    const callbackResponse = req.body.callbackResponse;
    var image = "";
    if (req.file) {
      const timestamp = moment().format("YYYYMMDDHHmmss");
      const originalname = req.file.originalname.replace(/ /g, ""); // Remove spaces

      const filename = `${timestamp}-${originalname}`;
      image = filename;
    }


    const newKYCDetails = new KYCDetails({
      userId: userId,
      callbackResponse: callbackResponse,
      image: image,
    });

    await newKYCDetails.save();

    res
      .status(200)
      .json({ message: "KYC details with images saved successfully" });
  } catch (error) {
    res
      .status(500)
      .json({
        error: "An error occurred while saving KYC details with images.",
      });
  }
};

export const getKYCDetailsForUser = async (req, res) => {
    const userId = req.params.userId;
  
    try {
      const kycDetails = await KYCDetails.find({ userId: userId });
  
      res.status(200).json(kycDetails);
    } catch (error) {
      res.status(500).json({ error: 'An error occurred while fetching KYC details.' });
    }
  };