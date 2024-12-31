import express from "express";
import {
  createUserGallery,
  getUserGallery,
  addComments,
  getSpecificImageComments,
} from "../Controllers/UserGalleryController.js";
import { uploadMiddleware } from "../utils/busboyMiddleware.js";
// import multer from "multer";
// import moment from "moment";


// const storageUserGallery = multer.diskStorage({
//   destination: "public/uploads/usergallery/",
//   filename: function (req, file, callback) {
//     const timestamp = moment().format("YYYYMMDDHHmmss");
//     const originalname = file.originalname.replace(/ /g, ""); // Remove spaces
//     const filename = `${timestamp}-${originalname}`;
//     callback(null, filename);
//   },
// });

// const uploadUserGallery = multer({
//   limits: {
//     fileSize: 1000000,
//   },
//   fileFilter(req, file, cb) {
//     if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
//       cb(new Error("Please upload an image."));
//     }
//     cb(undefined, true);
//   },

//   storage: storageUserGallery,
// });


export const UserGalleryRoute = express.Router();
export const UserGalleryPublicRoute = express.Router();

UserGalleryRoute.route("/upload").post(
  uploadMiddleware,
  createUserGallery
);
UserGalleryPublicRoute.get("/:userId", getUserGallery);
UserGalleryRoute.post("/add-comment", addComments);
UserGalleryRoute.get(
  "/:userId/images/:imageId/comments",
  getSpecificImageComments
);

export default UserGalleryRoute;
