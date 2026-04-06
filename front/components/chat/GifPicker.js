'use client';

import { useState } from 'react';
import { useI18n } from '../../i18n/I18nContext';

const TENOR_API_KEY = 'AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ'; // Free Tenor API key

export default function GifPicker({ onSelect, onClose }) {
  const { t } = useI18n();
  const [query, setQuery] = useState('');
  const [gifs, setGifs] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchGifs = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setGifs([]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(searchQuery)}&key=${TENOR_API_KEY}&limit=20&media_filter=tinygif`
      );
      const data = await res.json();
      setGifs(data.results || []);
    } catch (err) {
      console.error('GIF search error:', err);
    }
    setLoading(false);
  };

  const handleSearch = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (val.length > 1) {
      searchGifs(val);
    } else {
      setGifs([]);
    }
  };

  return (
    <div className="gif-picker">
      <div className="gif-picker-header">
        <input
          type="text"
          placeholder={t('gif.search')}
          value={query}
          onChange={handleSearch}
          autoFocus
        />
        <button className="gif-close-btn" onClick={onClose}>×</button>
      </div>

      <div className="gif-grid">
        {loading && <div className="gif-loading">...</div>}
        {gifs.map((gif) => (
          <img
            key={gif.id}
            src={gif.media_formats?.tinygif?.url}
            alt={gif.title}
            className="gif-item"
            onClick={() => {
              onSelect(gif.media_formats?.gif?.url || gif.media_formats?.tinygif?.url);
              onClose();
            }}
          />
        ))}
      </div>

      <div className="gif-footer">{t('gif.powered')}</div>
    </div>
  );
}
