import express from "express";

import {
  createUserDetails,
  getUserDetails,
} from "../Controllers/UserDetailController.js";

const userDetailRoute = express.Router();

userDetailRoute.post("/create", createUserDetails);
userDetailRoute.get("/:userId", getUserDetails);

export default userDetailRoute;
