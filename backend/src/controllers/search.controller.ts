import { Request, Response } from 'express';
import { SearchService } from '../services/search.service';
import { EvaluatorOptimizer } from '../services/evaluator-optimizer.service';

export class SearchController {
  private searchService: SearchService;
  private evaluatorOptimizer: EvaluatorOptimizer;

  constructor() {
    this.searchService = new SearchService();
    this.evaluatorOptimizer = new EvaluatorOptimizer();
  }

  searchByText = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log('Received request body:', req.body);
      
      // Получаем query из тела запроса, с проверкой на undefined
      const query = req.body?.query || '';
      
      if (!query) {
        res.status(400).json({ error: 'Search query is required' });
        return;
      }

      // Для отладки
      console.log('Processing text search for query:', query);

      // Perform the search with evaluator-optimizer
      const results = await this.evaluatorOptimizer.optimizeSearch(
        async () => await this.searchService.searchByText(query),
        query
      );

      res.status(200).json(results);
    } catch (error) {
      console.error('Error in text search:', error);
      res.status(500).json({ error: 'An error occurred during search' });
    }
  };

  searchWithImage = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log('Received image search request:');
      console.log('Body:', req.body);
      console.log('File:', req.file);
      
      // Получаем query из тела запроса, с проверкой на undefined
      const query = req.body?.query || '';
      const imageFile = req.file;

      if (!query && !imageFile) {
        res.status(400).json({ error: 'Search query or image is required' });
        return;
      }

      // Для отладки
      console.log('Processing image search for query:', query, 'with image:', imageFile?.originalname);

      // Perform the search with evaluator-optimizer
      const results = await this.evaluatorOptimizer.optimizeSearch(
        async () => await this.searchService.searchWithImage(query, imageFile),
        query,
        imageFile
      );

      res.status(200).json(results);
    } catch (error) {
      console.error('Error in image search:', error);
      res.status(500).json({ error: 'An error occurred during search' });
    }
  };
} 