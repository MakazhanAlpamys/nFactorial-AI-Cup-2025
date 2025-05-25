import React, { useState, useRef } from 'react';
import './SearchForm.css';

const SearchForm = ({ onSearch, loading }) => {
  const [query, setQuery] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const fileInputRef = useRef(null);

  const handleQueryChange = (e) => {
    setQuery(e.target.value);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query && !imageFile) {
      alert('Please enter a search query or upload an image.');
      return;
    }
    onSearch(query, imageFile);
  };

  const handleClearImage = () => {
    setImageFile(null);
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="search-form-container">
      <form className="search-form" onSubmit={handleSubmit}>
        <div className="search-input-container">
          <input
            type="text"
            className="search-input"
            placeholder="Enter your search query..."
            value={query}
            onChange={handleQueryChange}
          />
          <button
            type="submit"
            className="search-button"
            disabled={loading || (!query && !imageFile)}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
        
        <div className="image-upload-container">
          <label className="image-upload-label">
            <span>Upload Image (Optional)</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="image-input"
              ref={fileInputRef}
            />
          </label>
          
          {imagePreview && (
            <div className="image-preview-container">
              <img src={imagePreview} alt="Preview" className="image-preview" />
              <button
                type="button"
                className="clear-image-button"
                onClick={handleClearImage}
              >
                Remove
              </button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default SearchForm; 