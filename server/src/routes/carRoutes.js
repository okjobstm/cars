import express from 'express';
import {
  getCars,
  getCarById,
  createCar,
  updateCar,
  deleteCar,
  getFeaturedCars,
  searchCars,
  removeCarImages
} from '../controllers/carController.js';
import { protect, admin } from '../middlewares/auth.js';
import upload from '../middlewares/upload.js';

const router = express.Router();

router.get('/', getCars);
router.get('/featured', getFeaturedCars);
router.get('/search', searchCars);
router.get('/:id', getCarById);

router.route('/')
  .post(protect, upload.array('images', 5), createCar);

router.route('/:id')
  .put(protect, upload.array('images', 5), updateCar)
  .delete(protect, deleteCar);

router.delete('/:id/images', protect, removeCarImages);


export default router;
