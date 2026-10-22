import express from 'express';
// import { getFoods, searchFoods, getFoodById } from '../controllers/foodController.js';

const router = express.Router();

router.get('/', (req, res) => res.json({ message: 'Foods route' }));
// router.get('/search', searchFoods);
// router.get('/:id', getFoodById);

export default router;
