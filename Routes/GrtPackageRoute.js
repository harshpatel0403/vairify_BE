import express from 'express';

import { createGRTPackage, getAllGRTPackages, deleteGRTPackage } from "../Controllers/GRTPackageController.js"

const GrtPackageRoute = express.Router();

GrtPackageRoute.post('/create', createGRTPackage);
GrtPackageRoute.get('/all', getAllGRTPackages);
GrtPackageRoute.delete('/:id', deleteGRTPackage);

export default GrtPackageRoute;