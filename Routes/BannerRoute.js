import express from 'express';

import { createBanner, getBannersByUserId } from "../Controllers/BannerController.js"

const bannerrRouter = express.Router();

bannerrRouter.post('/create', createBanner);
bannerrRouter.get('/get-banners/:userId', getBannersByUserId);

export default bannerrRouter;