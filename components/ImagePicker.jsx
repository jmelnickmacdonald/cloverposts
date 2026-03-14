'use client';

import { useState } from 'react';
import { searchImages } from '@/lib/pexels';

export default function ImagePicker({ 
  selected, 
  onSelect, 
  maxImages = 10,
  isCarousel = true 
}) {
  const [tab, setTab] = useState('search');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploaded, setUploaded] = useState([]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    const { photos, error: apiError } = await searchImages(query);
    
    if (apiError) {
      setError(apiError);
    } else {
      setResults(photos);
    }
    
    setLoading(false);
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    
    const newImages = files.map((file, idx) => ({
      id: `upload-${Date.now()}-${idx}`,
      src: URL.createObjectURL(file),
      srcLarge: URL.createObjectURL(file),
      alt: file.name,
      isUpload: true,
      file: file,
    }));

    setUploaded(prev => [...prev, ...newImages]);
  };

  const toggleSelect = (image) => {
    const exists = selected.find(img => img.id === image.id);
    
    if (exists) {
      onSelect(selected.filter(img => img.id !== image.id));
    } else {
      if (!isCarousel && selected.length >= 1) {
        onSelect([image]);
      } else if (selected.length >= maxImages) {
        return;
      } else {
        onSelect([...selected, image]);
      }
    }
  };

  const isSelected = (id) => selected.some(img => img.id === id);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          onClick={() => setTab('search')}
          className={`
            flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all
            ${tab === 'search' 
              ? 'bg-green-600 text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
          `}
        >
          Search stock
        </button>
        <button
          onClick={() => setTab('upload')}
          className={`
            flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all
            ${tab === 'upload' 
              ? 'bg-green-600 text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
          `}
        >
          Upload yours
        </button>
      </div>

      {tab === 'search' && (
        <div className="space-y-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search free photos..."
              className="flex-1 p-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className={`
                px-4 py-2 rounded-lg font-medium text-white transition-all
                ${loading || !query.trim()
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'}
              `}
            >
              {loading ? '...' : 'Search'}
            </button>
          </form>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          {results.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {results.map(photo => (
                <div
                  key={photo.id}
                  onClick={() => toggleSelect(photo)}
                  className={`
                    aspect-square rounded-lg cursor-pointer relative overflow-hidden
                    transition-all hover:scale-105
                    ${isSelected(photo.id) ? 'ring-4 ring-green-600 ring-offset-2' : ''}
                  `}
                >
                  <img
                    src={photo.src}
                    alt={photo.alt}
                    className="w-full h-full object-cover"
                  />
                  {isSelected(photo.id) && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">✓</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {results.length === 0 && !loading && query && (
            <p className="text-sm text-gray-500 text-center py-8">
              No results. Try a different search.
            </p>
          )}

          {results.length === 0 && !query && (
            <p className="text-sm text-gray-500 text-center py-8">
              Search for photos above
            </p>
          )}
        </div>
      )}

      {tab === 'upload' && (
        <div className="space-y-4">
          <label className="block p-8 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-green-500 transition-all text-center">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="text-gray-500">
              <p className="text-2xl mb-2">📷</p>
              <p className="text-sm">Drop images here or click to upload</p>
            </div>
          </label>

          {uploaded.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {uploaded.map(photo => (
                <div
                  key={photo.id}
                  onClick={() => toggleSelect(photo)}
                  className={`
                    aspect-square rounded-lg cursor-pointer relative overflow-hidden
                    transition-all hover:scale-105
                    ${isSelected(photo.id) ? 'ring-4 ring-green-600 ring-offset-2' : ''}
                  `}
                >
                  <img
                    src={photo.src}
                    alt={photo.alt}
                    className="w-full h-full object-cover"
                  />
                  {isSelected(photo.id) && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">✓</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {selected.length > 0 && (
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <span className="text-sm font-medium text-gray-600 whitespace-nowrap">
            Selected: {selected.length}{isCarousel ? `/${maxImages}` : ''}
          </span>
          <div className="flex gap-1 overflow-x-auto">
            {selected.map(img => (
              <img
                key={img.id}
                src={img.src}
                alt={img.alt}
                className="w-10 h-10 rounded object-cover flex-shrink-0"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
