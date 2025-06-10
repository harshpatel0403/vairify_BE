import express from 'express';
import { createGroup, listGroups, getGroupDetails, updateGroup, getUniqueMembersForUser, updateMemberStatus, verifySmsCode, inviteMemberToGroup, removeMemberFromGroup, setAlarm, getAlarm, uploadProof, noteTimerStarted, activateAlarm } from '../Controllers/DateGuardGroupController.js';
import { uploadMiddleware } from '../utils/busboyMiddleware.js';
const dateGuardGrouprouter = express.Router();
// import multer from 'multer';
// import moment from 'moment';

// const storage = multer.diskStorage({
//     destination: "public/uploads/dateguard/",
//     filename: function (req, file, callback) {
//       const timestamp = moment().format("YYYYMMDDHHmmss");
//       const originalname = file.originalname.replace(/ /g, ''); // Remove spaces
//       const filename = `${timestamp}-${originalname}`;
//       callback(null, filename);
//     },
//   });

//   const upload = multer({
//     limits: {
//       fileSize: 1000000,
//     },
//     fileFilter(req, file, cb) {
//       if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
//         cb(new Error("Please upload an image."));
//       }
//       cb(undefined, true);
//     },

//     storage: storage,
//   });

dateGuardGrouprouter.post('/create/:userId', createGroup);
dateGuardGrouprouter.get('/all/:userId', listGroups);
dateGuardGrouprouter.get('/group/:groupId', getGroupDetails);
dateGuardGrouprouter.put('/group/update/:groupId', updateGroup);
dateGuardGrouprouter.get('/members/:userId', getUniqueMembersForUser);
dateGuardGrouprouter.put('/status', updateMemberStatus);
dateGuardGrouprouter.post('/verify', verifySmsCode);
dateGuardGrouprouter.post('/invite/:groupId', inviteMemberToGroup);
dateGuardGrouprouter.post('/remove/:groupId', removeMemberFromGroup);

dateGuardGrouprouter.get('/get-alarm', getAlarm);
dateGuardGrouprouter.post('/set-alarm', setAlarm);

dateGuardGrouprouter.post('/upload-proof', uploadMiddleware, uploadProof);
dateGuardGrouprouter.post('/start-timer', noteTimerStarted);

dateGuardGrouprouter.post('/disarm-alarm', activateAlarm)

export default dateGuardGrouprouter;
