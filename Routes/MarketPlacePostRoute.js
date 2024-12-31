import express from "express";
import {
  DeleteMarketPlacePost,
  addCommentToMarketPlacePost,
  createMarketPost,
  get,
  getAllCommentsMarketPlacePost,
  getAllMarketPost,
  getMarketPost,
  likeMarketPlacePost,
  updateMarketPost,
} from "../Controllers/MarketPlacePostController.js";
import { uploadMiddleware } from '../utils/busboyMiddleware.js'
// import multer from "multer";
// import moment from "moment";

const marketPostRouter = express.Router();

// const storageMarketPlacePost = multer.diskStorage({
//   destination: "public/uploads/marketPost/",
//   filename: function (req, file, callback) {
//     const timestamp = moment().format("YYYYMMDDHHmmss");
//     const originalname = file.originalname.replace(/ /g, ''); // Remove spaces
//     const filename = `${timestamp}-${originalname}`;
//     callback(null, filename);
//   },
// });

// const uploadpost = multer({
//   limits: {
//     fileSize: 1000000,
//   },
//   fileFilter(req, file, cb) {
//     if (!file.originalname.match(/\.(png|jpg|jpeg)$/i)) {
//       cb(new Error("Please upload an image."));
//     }
//     cb(undefined, true);
//   },

//   storage: storageMarketPlacePost,
// });

marketPostRouter
  .route("/create")
  .post(
    uploadMiddleware,
    createMarketPost);

marketPostRouter.get("/get/:userId", getMarketPost);
marketPostRouter.put("edit/:id", updateMarketPost);
marketPostRouter.delete("/delete", DeleteMarketPlacePost);
marketPostRouter.get("/get", get);
marketPostRouter.get("/getallpost", getAllMarketPost)

marketPostRouter.post("/comment/:postId", addCommentToMarketPlacePost)
marketPostRouter.post("/like/:postId", likeMarketPlacePost)

marketPostRouter.get("/get/comment/:postId", getAllCommentsMarketPlacePost)
export default marketPostRouter;
