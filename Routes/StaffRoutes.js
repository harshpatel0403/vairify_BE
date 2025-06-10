import express from 'express';
import { createNewStaff, assignPermissions, listStaff, getPermission } from "../Controllers/StaffController.js";
// import multer from "multer";
// import moment from "moment";
import { uploadMiddleware } from '../utils/busboyMiddleware.js'
const staffRouter = express.Router();

// const userProfileDir = `public/uploads/usersProfile/`;

// const storageProfiles = multer.diskStorage({
//     destination: userProfileDir,
//     filename: function (req, file, callback) {
//         const timestamp = moment().format("YYYYMMDDHHmmss");
//         const originalname = file.originalname.replace(/ /g, ''); // Remove spaces
//         const filename = `${timestamp}-${originalname}`;
//         callback(null, filename);
//     },
// });

// const upload = multer({
//     limits: {
//         fileSize: 1000000,
//     },
//     fileFilter(req, file, cb) {
//         if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
//             cb(new Error("Please upload an image."));
//         }
//         cb(undefined, true);
//     },

//     storage: storageProfiles,
// });


staffRouter.post('/createStaffProfile',
    uploadMiddleware,
    //  upload.single('userProfilePic'),
    createNewStaff);
staffRouter.post('/assignPermissions', assignPermissions);

staffRouter.post('/listStaff', listStaff);
staffRouter.post('/getPermissions/:staffId', getPermission);

export default staffRouter;
