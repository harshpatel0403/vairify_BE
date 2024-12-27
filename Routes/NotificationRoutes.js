import express from "express";
import {newNotification,getNotification,markNotification,deleteNotification, subscribeNotification, unsubscribeNotification} from "../Controllers/NotificationController.js";

const notificationRouter = express.Router();

notificationRouter.post("/", newNotification);
notificationRouter.get("/:userId", getNotification);
notificationRouter.patch("/:notificationId", markNotification);
notificationRouter.delete("/:notificationId", deleteNotification);
notificationRouter.post("/subscribe", subscribeNotification);
notificationRouter.post("/unsubscribe", unsubscribeNotification);




export default notificationRouter;
