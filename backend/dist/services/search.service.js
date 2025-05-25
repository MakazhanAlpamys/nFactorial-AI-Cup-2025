"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchService = void 0;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class SearchService {
    constructor() {
        this.serpApiKey = process.env.SERPAPI_KEY || '';
        if (!this.serpApiKey) {
            console.warn('SERPAPI_KEY not found in environment variables');
        }
    }
    async searchByText(query) {
        try {
            // Search the web using SerpAPI
            const searchResults = await this.performWebSearch(query);
            // Analyze results using Gemini
            const analysis = await this.analyzeResults(query, searchResults);
            return {
                query,
                results: searchResults,
                analysis
            };
        }
        catch (error) {
            console.error('Error in searchByText:', error);
            throw error;
        }
    }
    async searchWithImage(query, imageFile) {
        try {
            // If we have both query and image, we can do a more specific search
            const searchQuery = query || 'Image search';
            // Search the web using SerpAPI
            const searchResults = await this.performWebSearch(searchQuery);
            // Analyze results using Gemini, including the image if available
            const analysis = await this.analyzeResults(searchQuery, searchResults, imageFile);
            return {
                query: searchQuery,
                results: searchResults,
                analysis
            };
        }
        catch (error) {
            console.error('Error in searchWithImage:', error);
            throw error;
        }
    }
    async performWebSearch(query) {
        try {
            // Use SerpAPI to search Google
            const response = await axios_1.default.get('https://serpapi.com/search', {
                params: {
                    q: query,
                    api_key: this.serpApiKey,
                    engine: 'google'
                }
            });
            // Parse and transform the results
            const organicResults = response.data.organic_results || [];
            return organicResults.map((result, index) => ({
                title: result.title || '',
                link: result.link || '',
                snippet: result.snippet || '',
                position: index + 1
            }));
        }
        catch (error) {
            console.error('Error in performWebSearch:', error);
            throw error;
        }
    }
    async analyzeResults(query, results, imageFile) {
        try {
            // In a real implementation, this would use the Gemini API to analyze results
            // For now, we'll simulate the analysis
            // TODO: Implement Gemini API integration
            const analysis = `Analysis for query "${query}" with ${results.length} results found.`;
            return analysis;
        }
        catch (error) {
            console.error('Error in analyzeResults:', error);
            throw error;
        }
    }
}
exports.SearchService = SearchService;
