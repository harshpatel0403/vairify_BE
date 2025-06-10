import express from "express";
// import multer from "multer";
import moment from "moment";
import {
  createUser,
  getNetworks,
  loginUser,
  checkAffiliateValidity,
  createUserByAdmin,
  getUsersUnderAdmin,
  forgetPassword,
  verifyResetCodeAndResetPassword,
  optSend,
  verifyOtp,
  getUserTokens,
  addTokensToUser,
  uploadUserProfile,
  getUsers,
  checkUserPassword,
  verifyFace,
  saveLocation,
  getUsersWithIsTestFalse,
  getUser,
  verifyPhoneNumber,
  verifyOtpNumber,
  getMarketPlaceUser,
  userChangePassword,
  userPhoneResetPass,
  userPhoneResetPassVerify,
  userChangePasswordByPhone,
  generateSDKToken,
  getUpdatedInfo,
  getIncallAddresses,
  saveIncallAddresses,
  updateIncallAddresses,
  getAvailableStatus,
  updateAvailableStatus,
  getFavLocations,
  updateUserPreferences,
  signContract,
  changePassword,
  uploadFaceVerificationImage,
  resendOtp,
} from "../Controllers/UserController.js";
import { uploadMiddleware } from "../utils/busboyMiddleware.js";

const userRouter = express.Router();

export const userProfileDir = `public/uploads/usersProfile/`;

export const userKycProfileDir = `public/userKycImages/`;

export const faceImagesDir = `public/uploads/faceimages`;

// const storageProfiles = multer.diskStorage({
//   destination: userProfileDir,
//   filename: function (req, file, callback) {
//     const timestamp = moment().format("YYYYMMDDHHmmss");
//     const originalname = file.originalname.replace(/ /g, ""); // Remove spaces
//     const filename = `${timestamp}-${originalname}`;
//     callback(null, filename);
//   },
// });

// const uploadProfiles = multer({
//   limits: {
//     fileSize: 1000000,
//   },
//   fileFilter(req, file, cb) {
//     if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
//       cb(new Error("Please upload an image."));
//     }
//     cb(undefined, true);
//   },

//   storage: storageProfiles,
// });

// const storageFaces = multer.diskStorage({
//   destination: "public/uploads/usersFacesTemp/",
//   filename: function (req, file, callback) {
//     const timestamp = moment().format("YYYYMMDDHHmmss");
//     const originalname = file.originalname.replace(/ /g, ""); // Remove spaces
//     const filename = `${timestamp}-${originalname}`;
//     callback(null, filename);
//   },
// });

// const uploadFaces = multer({
//   limits: {
//     fileSize: 1000000,
//   },
//   fileFilter(req, file, cb) {
//     if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
//       cb(new Error("Please upload an image."));
//     }
//     cb(undefined, true);
//   },

//   storage: storageFaces,
// });

// const storageFaceVerification = multer.diskStorage({
//   destination: faceImagesDir,
//   filename: function (req, file, callback) {
//     const timestamp = moment().format("YYYYMMDDHHmmss");
//     const originalname = file.originalname.replace(/ /g, ""); // Remove spaces
//     const filename = `${timestamp}-${originalname}`;
//     callback(null, filename);
//   },
// });

// const uploadfaceimages = multer({
//   limits: {
//     fileSize: 1000000,
//   },
//   fileFilter(req, file, cb) {
//     if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
//       cb(new Error("Please upload an image."));
//     }
//     cb(undefined, true);
//   },

//   storage: storageFaceVerification,
// });

userRouter.route("/create").post(createUser);
userRouter.route("/admin/create").post(createUserByAdmin);
userRouter.route("/admin/:adminId/users").get(getUsersUnderAdmin);
userRouter.route("/user/:id").get(getUsers);
userRouter.route("/login").post(loginUser);
userRouter.route("/updated-information/:userId").get(getUpdatedInfo);
userRouter.route("/checkAffilate").post(checkAffiliateValidity);
userRouter.route("/check-password").post(checkUserPassword);
userRouter.route("/change-password").post(userChangePassword);

userRouter.route("/tokens/:userId").get(getUserTokens);
userRouter.route("/tokens/:userId").post(addTokensToUser);

userRouter.route("/network/:userId").get(getNetworks);

userRouter.post("/sendOtpCode", optSend);
userRouter.post("/verifyOtpCode", verifyOtp);
userRouter.post("/resendOtpCode", resendOtp);
userRouter.post("/forgotpassword", forgetPassword);
userRouter.post("/verifypassword", verifyResetCodeAndResetPassword);

userRouter.post("/verify-face/:userId", uploadMiddleware, verifyFace);
userRouter.post("/save-location/:userId", saveLocation);

userRouter
  .route("/profileUpload")
  .post(uploadMiddleware, uploadUserProfile);

userRouter
  .route("/upload-face-verification-image")
  .post(uploadMiddleware, uploadFaceVerificationImage);

userRouter.route("/all").get(getUsersWithIsTestFalse);

userRouter.get("/fetch/:userId", getUser);
userRouter.get("/fetch/marketplace/:userId", getMarketPlaceUser);
userRouter.route("/verifyPhone").post(verifyPhoneNumber);
userRouter.route("/verifyOtp").post(verifyOtpNumber);
userRouter.route("/resetPhonePass").post(userPhoneResetPass);
userRouter.route("/resetPhonePassVerify").post(userPhoneResetPassVerify);
userRouter.route("/changepassbyphone").post(userChangePasswordByPhone);
userRouter.post("/sdk-token", generateSDKToken);

// incall addresses
userRouter.get("/incall-addresses/:userId", getIncallAddresses);
userRouter.post("/incall-addresses/:userId", saveIncallAddresses);
userRouter.put("/incall-addresses/:userId/:id", updateIncallAddresses);

// vai now 2.0 
userRouter.get("/available-status/:userId", getAvailableStatus);
userRouter.post("/available-status/:userId", updateAvailableStatus);

// Faviourite locations
userRouter.get("/favourite-locations/:userId", getFavLocations);

// User Preferences
userRouter.post("/update-preferences/:userId", updateUserPreferences)

// sign mutual contract
userRouter.post("/sign-contract/:userId", signContract)

// change password
userRouter.post("/change-password/:userId", changePassword)
export default userRouter;
