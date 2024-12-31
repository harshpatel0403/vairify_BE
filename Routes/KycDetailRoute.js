import express from "express";
// import multer from "multer";
// import moment from "moment";

import {
  handleKYCCallback,
  getKYCDetailsForUser,
} from "../Controllers/KycDetailController.js";




// const storageUserKyc = multer.diskStorage({
//   destination: "public/uploads/userkyc/",
//   filename: function (req, file, callback) {
//     const timestamp = moment().format("YYYYMMDDHHmmss");
//     const originalname = file.originalname.replace(/ /g, ''); // Remove spaces
//     const filename = `${timestamp}-${originalname}`;
//     callback(null, filename);
//   },
// });

// const uploadUserKyc = multer({
//   limits: {
//     fileSize: 1000000,
//   },
//   fileFilter(req, file, cb) {
//     if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
//       cb(new Error("Please upload an image."));
//     }
//     cb(undefined, true);
//   },

//   storage: storageUserKyc,
// });

const KycDetailRoute = express.Router();

KycDetailRoute
  // .route("/callback")
  .post(
    "/callback"
    // uploadUserKyc.single("image")
    , handleKYCCallback
  );

KycDetailRoute.get("/details/:userId", getKYCDetailsForUser);

export default KycDetailRoute;
