import React, { useState } from 'react';
import './App.css';
import SearchForm from './components/SearchForm';
import SearchResults from './components/SearchResults';

function App() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (query, imageFile) => {
    setLoading(true);
    setError(null);
    try {
      let url = '';
      let options = {};
      
      if (imageFile) {
        // Если есть изображение, используем FormData
        url = 'http://localhost:3001/api/search/image';
        const formData = new FormData();
        formData.append('image', imageFile);
        formData.append('query', query);
        
        options = {
          method: 'POST',
          body: formData,
        };
      } else {
        // Для текстового поиска используем JSON
        url = 'http://localhost:3001/api/search/text';
        options = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query }),
        };
      }
      
      const response = await fetch(url, options);
      
      if (!response.ok) {
        throw new Error('Search failed');
      }
      
      const data = await response.json();
      setResults(data);
    } catch (err) {
      console.error('Error during search:', err);
      setError('An error occurred during search. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>SmartSearch AI</h1>
        <p>Intelligent search powered by AI</p>
      </header>
      <main className="App-main">
        <SearchForm onSearch={handleSearch} loading={loading} />
        {error && <div className="error-message">{error}</div>}
        {results && <SearchResults results={results} />}
      </main>
    </div>
  );
}

export default App;
