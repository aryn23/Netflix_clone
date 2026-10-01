import React, { useRef } from 'react';
import MovieCard from './MovieCard';
import '../styles/movies.css';

const MovieRow = ({ title, movies, watchlist = [], onToggleWatchlist, onCardClick, isLoggedIn }) => {
  const rowRef = useRef(null);

  const scroll = (offset) => {
    if (rowRef.current) {
      rowRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  if (!movies || movies.length === 0) return null;

  return (
    <div className="movie-section">
      <h2 className="section-title">{title}</h2>
      <div className="movie-row-container">
        <button className="scroll-btn scroll-btn-left" onClick={() => scroll(-300)}>
          {'<'}
        </button>
        <div className="movie-row" ref={rowRef}>
          {movies.map(movie => (
            <MovieCard 
              key={movie._id || movie.id} 
              movie={movie} 
              isInWatchlist={watchlist.includes(movie._id || movie.id)}
              onToggleWatchlist={onToggleWatchlist}
              onCardClick={onCardClick}
              isLoggedIn={isLoggedIn}
            />
          ))}
        </div>
        <button className="scroll-btn scroll-btn-right" onClick={() => scroll(300)}>
          {'>'}
        </button>
      </div>
    </div>
  );
};

export default MovieRow;
