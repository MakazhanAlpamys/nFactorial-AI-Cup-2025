"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchRoutes = void 0;
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const search_controller_1 = require("../controllers/search.controller");
const router = express_1.default.Router();
exports.searchRoutes = router;
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage });
const searchController = new search_controller_1.SearchController();
// Route for text-only search
router.post('/text', searchController.searchByText);
// Route for search with image
router.post('/image', upload.single('image'), searchController.searchWithImage);
