import express from "express";
import {
  getDateGuardCodeById,
  updateDateGuardCodeById,
  deleteDateGuardCodeById,
  createOrUpdateDateGuardCodes,
} from "../Controllers/DateGuardCodeController.js";

const DateGuarCodeRoute = express.Router();

DateGuarCodeRoute.post("/create/:userId", createOrUpdateDateGuardCodes);

DateGuarCodeRoute.get("/:id", getDateGuardCodeById);

DateGuarCodeRoute.put("/:id", updateDateGuardCodeById);

DateGuarCodeRoute.delete("/:id", deleteDateGuardCodeById);

export default DateGuarCodeRoute;
