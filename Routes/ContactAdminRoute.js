import express from "express";
import {createContact, getAllContacts} from "../Controllers/ContactAdminController.js"

const contactRoute = express.Router();

contactRoute.route("/create").post(createContact);
contactRoute.route("/all").get(getAllContacts);

export default contactRoute;
