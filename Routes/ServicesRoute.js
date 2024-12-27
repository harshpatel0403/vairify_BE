import express from "express";
import {
  createServicesDetails,
  getServicesDetails,
  updateService,
} from "../Controllers/ServicesController.js";

export const servicesRouter = express.Router();
export const servicesPublicRouter = express.Router();

servicesRouter.post("/create", createServicesDetails);
servicesRouter.put("/edit/:id", updateService);

servicesPublicRouter.get("/get-services/:userId", getServicesDetails);
// export default { servicesRouter, servicesPublicRouter };
