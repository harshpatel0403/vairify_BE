import express from "express";
import {
    getAllImportantDetails,
    updateImportantDetail,
    createImportantDetail,
} from "../Controllers/ImportantDetailController.js";

const importantDetailRouter = express.Router();


importantDetailRouter.get('/all', getAllImportantDetails);
importantDetailRouter.post('/create', createImportantDetail);
importantDetailRouter.put('/:id', updateImportantDetail);

export default importantDetailRouter;
