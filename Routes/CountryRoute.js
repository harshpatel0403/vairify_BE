import express from "express";
import {
  createCountry,
  getAllCountries,
  updateCountryStatus,
  deleteCountry,
  addLanguageToCountry,
  getLanguagesForCountry,
  deleteLanguageFromCountry,
  addCityToCountry,
  getCitiesForCountry,
  deleteCityFromCountry,
  addVaripayToCountry,
  getVaripaysForCountry,
  deleteVaripayFromCountry,
  getAllLanguages,
  addSocialToCountry,
  getSocailForCountry,
  deleteSocialFromCountry,
} from "../Controllers/CountryController.js";
// import multer from "multer";
// import moment from "moment";

const countryRouter = express.Router();

// const storageCountries = multer.diskStorage({
//   destination: "public/uploads/countries/",
//   filename: function (req, file, callback) {
//     const timestamp = moment().format("YYYYMMDDHHmmss");
//     const originalname = file.originalname.replace(/ /g, ""); // Remove spaces
//     const filename = `${timestamp}-${originalname}`;
//     callback(null, filename);
//   },
// });

// const uploadCountries = multer({
//   limits: {
//     fileSize: 1000000,
//   },
//   fileFilter(req, file, cb) {
//     if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
//       cb(new Error("Please upload an image."));
//     }
//     cb(undefined, true);
//   },

//   storage: storageCountries,
// });

// const storageLanguage = multer.diskStorage({
//   destination: "public/uploads/languages/",
//   filename: function (req, file, callback) {
//     const timestamp = moment().format("YYYYMMDDHHmmss");
//     const originalname = file.originalname.replace(/ /g, ""); // Remove spaces
//     const filename = `${timestamp}-${originalname}`;
//     callback(null, filename);
//   },
// });

// const uploadLanguages = multer({
//   limits: {
//     fileSize: 1000000,
//   },
//   fileFilter(req, file, cb) {
//     if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
//       cb(new Error("Please upload an image."));
//     }
//     cb(undefined, true);
//   },

//   storage: storageLanguage,
// });

// const storageVaripays = multer.diskStorage({
//   destination: "public/uploads/varipays/",
//   filename: function (req, file, callback) {
//     const timestamp = moment().format("YYYYMMDDHHmmss");
//     const originalname = file.originalname.replace(/ /g, ""); // Remove spaces
//     const filename = `${timestamp}-${originalname}`;
//     callback(null, filename);
//   },
// });

// const uploadVaripays = multer({
//   limits: {
//     fileSize: 1000000,
//   },
//   fileFilter(req, file, cb) {
//     if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
//       cb(new Error("Please upload an image."));
//     }
//     cb(undefined, true);
//   },

//   storage: storageVaripays,
// });

// const storageSocail = multer.diskStorage({
//   destination: "public/uploads/socials/",
//   filename: function (req, file, callback) {
//     const timestamp = moment().format("YYYYMMDDHHmmss");
//     const originalname = file.originalname.replace(/ /g, ""); // Remove spaces
//     const filename = `${timestamp}-${originalname}`;
//     callback(null, filename);
//   },
// });

// const uploadSocial = multer({
//   limits: {
//     fileSize: 1000000,
//   },
//   fileFilter(req, file, cb) {
//     if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
//       cb(new Error("Please upload an image."));
//     }
//     cb(undefined, true);
//   },

//   storage: storageSocail,
// });

//Route to get all countries
countryRouter.get("/all", getAllCountries);

// Route to create a new country
countryRouter
  // .route("/create")
  .post(
    "/create"
    // uploadCountries.single("image")
    , createCountry);

// Route to update status of country
countryRouter.put("/:id/status", updateCountryStatus);

// Route to delete country
countryRouter.delete("/:id", deleteCountry);

// Route to add lanague to the country
countryRouter
  // .route("/:id/languages/create")
  .post(
    "/:id/languages/create"
    // uploadLanguages.single("image")
    , addLanguageToCountry);

// Route to get  selected country languages
countryRouter.get("/:id/languages", getLanguagesForCountry);

// Route to delete  selected country languages
countryRouter.delete("/:id/languages/:languageId", deleteLanguageFromCountry);

// Route to create  selected country cities
countryRouter.post("/:id/cities/create", addCityToCountry);

// Route to get  selected country cities
countryRouter.get("/:id/cities", getCitiesForCountry);

// Route to delete  selected country cities
countryRouter.delete("/:id/cities/:cityId", deleteCityFromCountry);

// Route to create  selected country varipays
countryRouter
  // .route("/:id/varipays/create")
  .post(
    "/:id/varipays/create"
    // uploadVaripays.single("image")
    , addVaripayToCountry);

// Route to get  selected country varipays
countryRouter.get("/:id/varipays", getVaripaysForCountry);

// Route to delete  selected country varipays
countryRouter.delete("/:id/varipays/:varipayId", deleteVaripayFromCountry);

countryRouter
  // .route("/:id/social/create")
  .post(
    "/:id/social/create"
    // uploadSocial.single("image")
    , addSocialToCountry);

countryRouter.get("/:id/social", getSocailForCountry);

countryRouter.delete("/:id/social/:socialId", deleteSocialFromCountry);

// Route to get all langauges
countryRouter.get("/alllangauges", getAllLanguages);

export default countryRouter;
