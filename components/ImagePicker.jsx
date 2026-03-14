'use client';
import { useState } from 'react';
import { searchImages } from '../lib/pexels';

export default function ImagePicker({ images, onChange, maxImages, topicSuggestions = [] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [activeTab, setActiveTab] = useState('search'); // 'search' or 'upload'

  // Prompt categories
  const promptCategories = {
    vibes: ['minimal', 'cozy', 'bold', 'moody', 'bright', 'warm', 'elegant', 'rustic'],
    spaces: ['kitchen', 'living room', 'backyard', 'office', 'bedroom', 'bathroom', 'exterior', 'patio'],
    feels: ['celebration', 'peaceful', 'professional', 'playful', 'luxurious', 'natural', 'modern'],
    objects: ['keys', 'coffee', 'plants', 'laptop', 'books', 'candles', 'flowers', 'furniture'],
  };

  const handleTagClick = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSearch = async (query = null) => {
    const searchTerm = query || [...selectedTags, searchQuery].filter(Boolean).join(' ');
    if (!searchTerm.trim()) return;

    setIsSearching(true);
    try {
      const results = await searchImages(searchTerm);
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    handleSearch(suggestion);
  };

  const handleSelectImage = (image) => {
    if (images.length >= maxImages) return;
    
    const newImage = {
      id: image.id,
      url: image.src.large,
      thumbnail: image.src.medium,
      photographer: image.photographer,
      source: 'pexels',
    };
    
    onChange([...images, newImage]);
  };

  const handleRemoveImage = (imageId) => {
    onChange(images.filter(img => img.id !== imageId));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const remainingSlots = maxImages - images.length;
    
    files.slice(0, remainingSlots).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newImage = {
          id: `upload-${Date.now()}-${Math.random()}`,
          url: event.target.result,
          thumbnail: event.target.result,
          source: 'upload',
        };
        onChange(prev => [...prev, newImage]);
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="space-y-4">
      {/* Selected Images */}
      {images.length > 0 && (
        <div>
          <p className="text-gray-600 text-sm mb-2">
            Selected ({images.length}/{maxImages}):
          </p>
          <div className="flex flex-wrap gap-2">
            {images.map((img) => (
              <div key={img.id} className="relative group">
                <img
                  src={img.thumbnail}
                  alt="Selected"
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <button
                  onClick={() => handleRemoveImage(img.id)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('search')}
          className={`px-4 py-2 font-medium transition-all ${
            activeTab === 'search'
              ? 'text-green-600 border-b-2 border-green-500'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Search stock photos
        </button>
        <button
          onClick={() => setActiveTab('upload')}
          className={`px-4 py-2 font-medium transition-all ${
            activeTab === 'upload'
              ? 'text-green-600 border-b-2 border-green-500'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Upload yours
        </button>
      </div>

      {activeTab === 'upload' && (
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
          <input
            type="file"
            accept="image/*"
            multiple={maxImages > 1}
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer text-green-600 hover:text-green-700 font-medium"
          >
            Click to upload images
          </label>
          <p className="text-gray-500 text-sm mt-2">
            {maxImages > 1 ? `Up to ${maxImages} images` : 'One image'}
          </p>
        </div>
      )}

      {activeTab === 'search' && (
        <>
          {/* Topic-based suggestions */}
          {topicSuggestions.length > 0 && (
            <div>
              <p className="text-gray-600 text-sm mb-2">Based on your topic:</p>
              <div className="flex flex-wrap gap-2">
                {topicSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm hover:bg-green-200 transition-all"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Prompt categories */}
          <div className="space-y-3">
            <p className="text-gray-600 text-sm">Or build your search:</p>
            
            {Object.entries(promptCategories).map(([category, tags]) => (
              <div key={category}>
                <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">{category}</p>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleTagClick(tag)}
                      className={`px-2.5 py-1 rounded-full text-sm transition-all ${
                        selectedTags.includes(tag)
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Selected tags display */}
          {selectedTags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 p-3 bg-gray-50 rounded-xl">
              <span className="text-gray-500 text-sm">Selected:</span>
              {selectedTags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-green-500 text-white rounded-full text-sm flex items-center gap-1"
                >
                  {tag}
                  <button
                    onClick={() => handleTagClick(tag)}
                    className="hover:text-green-200"
                  >
                    ×
                  </button>
                </span>
              ))}
              <button
                onClick={() => setSelectedTags([])}
                className="text-gray-400 hover:text-gray-600 text-sm ml-2"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Search box */}
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Add more keywords..."
              className="flex-grow p-3 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              onClick={() => handleSearch()}
              disabled={isSearching || (!searchQuery.trim() && selectedTags.length === 0)}
              className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-medium px-6 py-3 rounded-xl transition-all"
            >
              {isSearching ? '...' : 'Search'}
            </button>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div>
              <p className="text-gray-600 text-sm mb-2">Results:</p>
              <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                {searchResults.map((photo) => (
                  <button
                    key={photo.id}
                    onClick={() => handleSelectImage(photo)}
                    disabled={images.length >= maxImages || images.some(img => img.id === photo.id)}
                    className={`relative group overflow-hidden rounded-lg ${
                      images.some(img => img.id === photo.id)
                        ? 'ring-2 ring-green-500'
                        : ''
                    } ${images.length >= maxImages ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <img
                      src={photo.src.medium}
                      alt={photo.photographer}
                      className="w-full h-24 object-cover"
                    />
                    {images.some(img => img.id === photo.id) && (
                      <div className="absolute inset-0 bg-green-500/30 flex items-center justify-center">
                        <span className="text-white text-2xl">✓</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <p className="text-gray-400 text-xs mt-2">Photos from Pexels</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
