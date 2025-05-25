import express from 'express';
import multer from 'multer';
import { SearchController } from '../controllers/search.controller';

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });
const searchController = new SearchController();

// Маршрут для текстового поиска
router.post('/text', searchController.searchByText);

// Маршрут для поиска с изображением
router.post('/image', upload.single('image'), searchController.searchWithImage);

export { router as searchRoutes }; 