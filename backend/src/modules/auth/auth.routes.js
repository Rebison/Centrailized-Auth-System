import express from 'express';
import * as AuthController from './auth.controllers.js';

const router = express.Router();

router.post('/login', AuthController.loginV1);

router.post('/logout', AuthController.logoutV1);

export default router;