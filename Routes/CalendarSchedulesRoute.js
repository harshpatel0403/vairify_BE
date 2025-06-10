import express from "express";
import {
  createCalendarDetail,
  deleteCalendarService,
  getCalendarDetails,
  getCalendarSettings,
  updateCalendarService,
  updateCalendarSettings,
  syncGoogleEvents,
  googleAuthCallback,
  syncMicrosoftEvents,
  microsoftAuthCallback
} from "../Controllers/CalendarScheduleController.js";
import { tokenVerification } from "../Config/apiVerify.js";

const calenderRouter = express.Router();

calenderRouter.post("/create", tokenVerification, createCalendarDetail);
calenderRouter.get("/get-calendar/:userId", tokenVerification, getCalendarDetails);
calenderRouter.put("/edit/:id", tokenVerification, updateCalendarService);
calenderRouter.delete("/delete/:id", tokenVerification, deleteCalendarService);
calenderRouter.post("/create/setting", tokenVerification, updateCalendarSettings);
calenderRouter.get("/get/settings/:userId", tokenVerification, getCalendarSettings);
calenderRouter.post("/sync-google", tokenVerification, syncGoogleEvents);
calenderRouter.post("/sync-microsoft", tokenVerification, syncMicrosoftEvents);
calenderRouter.get('/google-auth-callback', googleAuthCallback)
calenderRouter.get('/microsoft-auth-callback', microsoftAuthCallback)

export default calenderRouter;
