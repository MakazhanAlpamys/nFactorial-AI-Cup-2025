"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchController = void 0;
const search_service_1 = require("../services/search.service");
const evaluator_optimizer_service_1 = require("../services/evaluator-optimizer.service");
class SearchController {
    constructor() {
        this.searchByText = async (req, res) => {
            try {
                const { query } = req.body;
                if (!query) {
                    return res.status(400).json({ error: 'Search query is required' });
                }
                // Perform the search with evaluator-optimizer
                const results = await this.evaluatorOptimizer.optimizeSearch(async () => await this.searchService.searchByText(query), query);
                res.status(200).json(results);
            }
            catch (error) {
                console.error('Error in text search:', error);
                res.status(500).json({ error: 'An error occurred during search' });
            }
        };
        this.searchWithImage = async (req, res) => {
            try {
                const { query } = req.body;
                const imageFile = req.file;
                if (!query && !imageFile) {
                    return res.status(400).json({ error: 'Search query or image is required' });
                }
                // Perform the search with evaluator-optimizer
                const results = await this.evaluatorOptimizer.optimizeSearch(async () => await this.searchService.searchWithImage(query, imageFile), query, imageFile);
                res.status(200).json(results);
            }
            catch (error) {
                console.error('Error in image search:', error);
                res.status(500).json({ error: 'An error occurred during search' });
            }
        };
        this.searchService = new search_service_1.SearchService();
        this.evaluatorOptimizer = new evaluator_optimizer_service_1.EvaluatorOptimizer();
    }
}
exports.SearchController = SearchController;
