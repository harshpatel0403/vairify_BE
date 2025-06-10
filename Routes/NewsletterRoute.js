import express from 'express';

import { subscribeNewsletter } from '../Controllers/NewsLetterController.js';


const newsletterRoute = express.Router();

newsletterRoute.post('/create', subscribeNewsletter);



export default newsletterRoute;