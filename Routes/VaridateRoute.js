import express from 'express';
import { appointmentsCount, getAppointment, getAppointments, getPastAppointments, getReviews, getUpcomingAppointments, getVaiCheckAppointments, getVaiNowAppointments, postReview, saveAppointment, updateAppointment } from '../Controllers/VaridateController.js';
// import multer from 'multer';
import moment from 'moment';
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

const VaridateRoutes = express.Router();
export const VaridatePublicRoutes = express.Router();

VaridateRoutes.post("/add-appointment",
  uploadMiddleware
  //  uploadSelfie.any()
  , saveAppointment)
VaridateRoutes.get('/appointments/:userId', getAppointments)
VaridateRoutes.get('/vai-now/appointments/:userId', getVaiNowAppointments)
VaridateRoutes.get('/vai-check/appointments/:userId', getVaiCheckAppointments)
VaridateRoutes.get("/appointments-count/:id", appointmentsCount)

VaridateRoutes.get('/appointment/upcoming/:userId', getUpcomingAppointments)
VaridateRoutes.get('/appointment/history/:userId', getPastAppointments)
VaridateRoutes.get('/appointment/:appointmentId', getAppointment)
VaridateRoutes.put('/appointment/:userId/:appointmentId',
  uploadMiddleware
  // uploadSelfie.any()
  , updateAppointment)


VaridatePublicRoutes.get('/reviews/:userId', getReviews)
VaridateRoutes.post('/review/:revieweeId/:appointmentId/:userId', postReview)

VaridateRoutes.get("/appointments/:userId", getAppointments)

export default VaridateRoutes;