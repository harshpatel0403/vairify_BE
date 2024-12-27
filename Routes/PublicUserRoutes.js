import express from "express";
import { getPublicUserProfile } from "../Controllers/PublicUserController.js";

const publicUserRouter = express.Router();

publicUserRouter.route("/:vaiId").get(getPublicUserProfile);

export default publicUserRouter;
