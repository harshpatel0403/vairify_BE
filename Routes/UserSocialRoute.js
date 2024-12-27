import express from 'express';
import { addUserSocial, getUserSocials } from '../Controllers/UserSocialController.js';



const UserSocialRoutes = express.Router();

UserSocialRoutes.post('/add-socials', addUserSocial);
UserSocialRoutes.get('/:userId', getUserSocials);

export default UserSocialRoutes;