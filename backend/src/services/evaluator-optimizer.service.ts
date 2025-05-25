import { z } from 'zod';
import { SearchResponse } from './search.service';

// Interfaces
interface EvaluationResult {
  evaluation: 'PASS' | 'NEEDS_IMPROVEMENT' | 'FAIL';
  feedback: string;
}

type SearchFunction = () => Promise<SearchResponse>;

export class EvaluatorOptimizer {
  // Maximum number of iterations to prevent infinite loops
  private maxIterations: number = 3;
  
  constructor() {}

  /**
   * Optimize search results through iterative refinement
   * @param searchFn Function that performs the search
   * @param query The search query
   * @param imageFile Optional image file for image-based search
   * @returns Optimized search response
   */
  async optimizeSearch(
    searchFn: SearchFunction, 
    query: string,
    imageFile?: Express.Multer.File
  ): Promise<SearchResponse> {
    let currentResponse: SearchResponse;
    let iterations = 0;
    let memory: SearchResponse[] = [];
    
    // Initial search
    currentResponse = await searchFn();
    memory.push(currentResponse);
    
    // Iterate until we get a passing evaluation or reach max iterations
    while (iterations < this.maxIterations) {
      console.log(`Optimization iteration ${iterations + 1} for query: "${query}"`);
      
      // Evaluate the current results
      const evaluation = await this.evaluateResults(currentResponse, query, imageFile);
      
      // If results are satisfactory, return them
      if (evaluation.evaluation === 'PASS') {
        console.log('Search optimization passed! Returning results.');
        return currentResponse;
      }
      
      // Otherwise, try again with feedback
      console.log(`Evaluation feedback: ${evaluation.feedback}`);
      
      // In a real implementation, we would adjust the search based on feedback
      // For now, we'll just call the search function again
      currentResponse = await searchFn();
      memory.push(currentResponse);
      
      // Combine insights from multiple searches
      currentResponse = this.combineSearchResults(memory);
      
      iterations++;
    }
    
    console.log(`Reached maximum iterations (${this.maxIterations}). Returning best results.`);
    return currentResponse;
  }
  
  /**
   * Evaluate search results against criteria
   * @param response The search response to evaluate
   * @param query The original search query
   * @param imageFile Optional image file for context
   * @returns Evaluation result with feedback
   */
  private async evaluateResults(
    response: SearchResponse,
    query: string,
    imageFile?: Express.Multer.File
  ): Promise<EvaluationResult> {
    try {
      // Check if there are enough results
      if (response.results.length === 0) {
        return {
          evaluation: 'FAIL',
          feedback: 'No search results found. Try a different query or approach.'
        };
      }
      
      // Check if the analysis is substantial
      if (!response.analysis || response.analysis.length < 20) {
        return {
          evaluation: 'NEEDS_IMPROVEMENT',
          feedback: 'Analysis is too brief. Need more detailed insights.'
        };
      }
      
      // For demonstration, we'll randomly decide if results are good enough
      const randomValue = Math.random();
      if (randomValue < 0.3 && response.results.length > 0) {
        return {
          evaluation: 'PASS',
          feedback: 'Results are comprehensive and analysis is insightful.'
        };
      } else if (randomValue < 0.7) {
        return {
          evaluation: 'NEEDS_IMPROVEMENT',
          feedback: 'Results need more diversity. Try expanding the search context.'
        };
      } else {
        return {
          evaluation: 'NEEDS_IMPROVEMENT',
          feedback: 'Analysis needs to be more focused on the key aspects of the query.'
        };
      }
    } catch (error) {
      console.error('Error in evaluateResults:', error);
      return {
        evaluation: 'FAIL',
        feedback: 'Evaluation process failed. Please try again.'
      };
    }
  }
  
  /**
   * Combine insights from multiple search iterations
   * @param responses Array of search responses from different iterations
   * @returns Combined search response
   */
  private combineSearchResults(responses: SearchResponse[]): SearchResponse {
    if (responses.length === 0) {
      throw new Error('No search responses to combine');
    }
    
    // Get the latest response as a base
    const latestResponse = responses[responses.length - 1];
    
    // In a real implementation, this would use more sophisticated merging
    // For now, we'll use the latest response with an enhanced analysis
    const enhancedAnalysis = `Combined analysis from ${responses.length} iterations: ${latestResponse.analysis}`;
    
    return {
      ...latestResponse,
      analysis: enhancedAnalysis
    };
  }
} 