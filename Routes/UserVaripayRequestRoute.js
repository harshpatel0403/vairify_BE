import express from "express";

import {
  createUserVaripayRequest,
  getUserVaripayRequestById,
  deleteUserVaripayRequest,
  UpdateVaripayRequest,
} from "../Controllers/UserVaripayRequestController.js";

const UserVaripayRequestRoute = express.Router();

UserVaripayRequestRoute.post("/create", createUserVaripayRequest);
UserVaripayRequestRoute.get(
  "/:id",
  getUserVaripayRequestById
);

UserVaripayRequestRoute.delete(
  "/:requestId",
  deleteUserVaripayRequest
);

UserVaripayRequestRoute.patch(
  "/:requestId",
  UpdateVaripayRequest
);

export default UserVaripayRequestRoute;
