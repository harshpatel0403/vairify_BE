import express from 'express';
// import multer from "multer";
// import moment from 'moment';
import { createUserPost, getAllUserPosts, likeUserPost, addCommentToUserPost, getAllCommentsForUserPost } from "../Controllers/UserPostController.js"

// multer not used for now
// const storageUserPosts = multer.diskStorage({
//     destination: "public/uploads/usersPost/",
//     filename: function (req, file, callback) {
//       const timestamp = moment().format("YYYYMMDDHHmmss");
//       const originalname = file.originalname.replace(/ /g, '');
//       const filename = `${timestamp}-${originalname}`;
//       callback(null, filename);
//     },
//   });

// const uploadUserPosts = multer({
//     limits: {
//         fileSize: 1000000,
//     },
//     fileFilter(req, file, cb) {
//         if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
//             cb(new Error("Please upload an image."));
//         }
//         cb(undefined, true);
//     },

//     storage: storageUserPosts,
// });


const UserPostRoute = express.Router();

UserPostRoute
    // .route("/upload")
    .post(
        "/upload"
        // uploadUserPosts.single("image")
        , createUserPost);
UserPostRoute.get('/all', getAllUserPosts);
UserPostRoute.post('/:postId/like', likeUserPost);
UserPostRoute.post('/:postId/comment', addCommentToUserPost);
UserPostRoute.get('/:postId/comment', getAllCommentsForUserPost);


export default UserPostRoute;