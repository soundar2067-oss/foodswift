import express from 'express';
// import { getUserSettings, updateUserSettings } from '../controllers/userController.js';

const router = express.Router();

router.get('/', (req, res) => res.json({ message: 'User routes' }));

export default router;
