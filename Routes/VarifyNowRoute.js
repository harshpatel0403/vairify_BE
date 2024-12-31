import express from 'express';
import { isAvailableNow, createVairifyNowSearch, updateVairifyNowSearch, getVairifyNowSearch, getVairifyNowSearchResult, getVairifyNowAppointment, getVairifyNowAppointments, getReviews, postReview, saveVairifyNowAppointment, updateVairifyNowAppointment, InvitationV2, requestLocation, approveRejectLocation, getLocationRequests } from '../Controllers/VairifyNowController.js';
// import multer from 'multer';
// import moment from 'moment';
import { uploadMiddleware } from '../utils/busboyMiddleware.js';

// export const manualSelfieDir = `public/uploads/manualSelfies/`

// const storageSelfies = multer.diskStorage({
//   destination: manualSelfieDir,
//   filename: function (req, file, callback) {
//     const timestamp = moment().format("YYYYMMDDHHmmss");
//     const originalname = file.originalname.replace(/ /g, ''); // Remove spaces
//     const filename = `${timestamp}-${originalname}`;
//     callback(null, filename);
//   },
// });

// const uploadSelfie = multer({
//   limits: {
//     fileSize: 1000000,
//   },
//   fileFilter(req, file, cb) {
//     if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
//       cb(new Error("Please upload an image."));
//     }
//     cb(undefined, true);
//   },

//   storage: storageSelfies,
// });

const VairifyNowRoutes = express.Router();

VairifyNowRoutes.put("/available-now", isAvailableNow);
VairifyNowRoutes.post("/create-search", createVairifyNowSearch);
VairifyNowRoutes.put("/edit-search/:id", updateVairifyNowSearch);
VairifyNowRoutes.get("/get-search/:userId", getVairifyNowSearch);
VairifyNowRoutes.get("/get-result", getVairifyNowSearchResult);
VairifyNowRoutes.post("/add-appointment",
  //  uploadSelfie.any(),
  uploadMiddleware,
  saveVairifyNowAppointment)
VairifyNowRoutes.get('/appointments/:userId', getVairifyNowAppointments)
VairifyNowRoutes.get('/appointment/:appointmentId', getVairifyNowAppointment)
VairifyNowRoutes.put('/appointment/:userId/:appointmentId',
  //  uploadSelfie.any(),
  uploadMiddleware,
  updateVairifyNowAppointment)
VairifyNowRoutes.get('/reviews/:userId', getReviews)
VairifyNowRoutes.post('/review/:revieweeId/:appointmentId/:userId', postReview)
VairifyNowRoutes.get("/appointments/:userId", getVairifyNowAppointments)

VairifyNowRoutes.post("/invitation", InvitationV2);

VairifyNowRoutes.get("/request-location/:userId", getLocationRequests);
VairifyNowRoutes.put("/request-location/update/:notificationId", approveRejectLocation);
VairifyNowRoutes.post("/request-location/:userId/:profileId", requestLocation);

export default VairifyNowRoutes;