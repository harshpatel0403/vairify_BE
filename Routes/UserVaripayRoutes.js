import express from 'express';
import { addPaymentInfo, getUserVaripays, compareVaripayPaymentMethods } from "../Controllers/UserVaripayController.js"
import { uploadMiddleware } from '../utils/busboyMiddleware.js';
// import multer from "multer";
// import moment from 'moment';

// const storageUserVaripays = multer.diskStorage({
//     destination: "public/uploads/user_varipays/",
//     filename: function (req, file, callback) {
//       const timestamp = moment().format("YYYYMMDDHHmmss");
//       const originalname = file.originalname.replace(/ /g, ''); // Remove spaces
//       const filename = `${timestamp}-${originalname}`;
//       callback(null, filename);
//     },
//   });


//   const uploadUserVaripays = multer({
//     limits: {
//       fileSize: 1000000,
//     },
//     fileFilter(req, file, cb) {
//       if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
//         cb(new Error("Please upload an image."));
//       }
//       cb(undefined, true);
//     },

//     storage: storageUserVaripays,
//   });


const UserVaripayRoutes = express.Router();
export const UserVaripayPublicRoutes = express.Router();

UserVaripayPublicRoutes.get('/:userId', getUserVaripays);
UserVaripayRoutes.route("/add-varipays").post(uploadMiddleware, addPaymentInfo);
UserVaripayRoutes.get('/compare/:user1Id/:user2Id', compareVaripayPaymentMethods);


export default UserVaripayRoutes;