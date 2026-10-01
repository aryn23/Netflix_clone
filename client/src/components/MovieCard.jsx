import React from 'react';
import { useNavigate } from 'react-router-dom';

const MovieCard = ({ movie, isInWatchlist, onToggleWatchlist, onCardClick, isLoggedIn }) => {
  const navigate = useNavigate();

  const handleWatchlistClick = (e) => {
    e.stopPropagation();
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    onToggleWatchlist(movie._id || movie.id);
  };

  const handleCardClick = () => {
    if (onCardClick) {
      onCardClick(movie);
    }
  };

  return (
    <div className="movie-card" onClick={handleCardClick} style={{ cursor: onCardClick ? 'pointer' : 'default' }}>
      <img src={movie.posterUrl || movie.posterPath || movie.imageUrl || 'https://via.placeholder.com/200x300?text=No+Image'} alt={movie.title} />
      <div className="movie-card-overlay">
        <div className="movie-card-title">{movie.title}</div>
        <div className="movie-card-meta">
          <span className="movie-card-rating">
            {movie.rating ? `${movie.rating * 10}% Match` : 'New'}
          </span>
          <span>{movie.year || ''}</span>
        </div>
      </div>
      <div className="movie-card-actions">
        <button 
          className={`btn-watchlist ${isInWatchlist ? 'in-watchlist' : ''}`}
          onClick={handleWatchlistClick}
          title={isInWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
        >
          {isInWatchlist ? '✓' : '+'}
        </button>
      </div>
    </div>
  );
};

export default MovieCard;
