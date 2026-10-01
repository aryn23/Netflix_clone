import React from 'react';
import '../styles/hero.css';

const HeroBanner = ({ movie }) => {
  if (!movie) return null;

  const truncate = (str, n) => {
    return str?.length > n ? str.substr(0, n - 1) + "..." : str;
  };

  return (
    <header 
      className="hero"
      style={{
        backgroundImage: `url(${movie.backdropUrl || movie.backdropPath || movie.posterUrl || ''})`
      }}
    >
      <div className="hero-overlay"></div>
      <div className="hero-content">
        <h1 className="hero-title">{movie.title}</h1>
        <div className="hero-description">
          {truncate(movie.description || 'Watch this amazing title now on Netflix.', 200)}
        </div>
        <div className="hero-buttons">
          <button className="btn-play">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
            Play
          </button>
          <button className="btn-info">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            More Info
          </button>
        </div>
      </div>
    </header>
  );
};

export default HeroBanner;
