import React from 'react';
import './SearchResults.css';

const SearchResults = ({ results }) => {
  if (!results) return null;

  const { query, results: searchResults, analysis } = results;
  
  // Извлекаем краткий ответ из анализа (первый абзац после заголовка)
  const getQuickAnswer = () => {
    if (!analysis) return null;
    
    // Если анализ начинается с заголовка в формате Markdown (#)
    if (analysis.startsWith('#')) {
      const lines = analysis.split('\n');
      // Пропускаем заголовок и ищем первый непустой абзац
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim() && !lines[i].startsWith('#') && !lines[i].startsWith('-') && !lines[i].startsWith('*')) {
          return lines[i].trim();
        }
      }
    }
    
    // Если нет явного форматирования, берем первый абзац
    const firstParagraph = analysis.split('\n\n')[0];
    if (firstParagraph && !firstParagraph.startsWith('#')) {
      return firstParagraph.trim();
    }
    
    return null;
  };
  
  const quickAnswer = getQuickAnswer();

  return (
    <div className="search-results">
      <div className="search-summary">
        <h2>Search Results for: <span className="highlight">{query}</span></h2>
        <div className="results-count">{searchResults.length} results found</div>
      </div>

      {quickAnswer && (
        <div className="quick-answer">
          <h3>Quick Answer</h3>
          <p>{quickAnswer}</p>
        </div>
      )}

      <div className="analysis-container">
        <h3>AI Analysis</h3>
        <div className="analysis-content">
          {analysis.split('\n').map((line, index) => {
            // Обработка заголовков Markdown
            if (line.startsWith('# ')) {
              return <h2 key={index}>{line.substring(2)}</h2>;
            } else if (line.startsWith('## ')) {
              return <h3 key={index}>{line.substring(3)}</h3>;
            } else if (line.startsWith('### ')) {
              return <h4 key={index}>{line.substring(4)}</h4>;
            }
            // Обработка жирного текста и списков
            else if (line.includes('**')) {
              return (
                <p key={index} dangerouslySetInnerHTML={{ 
                  __html: line
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\- /g, '• ')
                }} />
              );
            }
            // Обычный текст
            else if (line.trim()) {
              return <p key={index}>{line}</p>;
            }
            // Пустые строки для разделения абзацев
            return <br key={index} />;
          })}
        </div>
      </div>

      <div className="results-list">
        {searchResults.map((result, index) => (
          <div key={index} className="result-item">
            <h3 className="result-title">
              <a href={result.link} target="_blank" rel="noopener noreferrer">
                {result.title}
              </a>
            </h3>
            <div className="result-link">{result.link}</div>
            <div className="result-snippet">{result.snippet}</div>
          </div>
        ))}
      </div>

      {searchResults.length === 0 && (
        <div className="no-results">
          No results found. Try refining your search query or uploading a different image.
        </div>
      )}
    </div>
  );
};

export default SearchResults; 