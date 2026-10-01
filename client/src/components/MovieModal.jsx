import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/modal.css';

const MovieModal = ({ movie, isOpen, onClose, isInWatchlist, onToggleWatchlist, isLoggedIn }) => {
  const navigate = useNavigate();

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !movie) return null;

  const handleWatchlistClick = () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    onToggleWatchlist(movie._id || movie.id);
  };

  const handleOverlayClick = (e) => {
    if (e.target.className === 'modal-overlay') {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>✕</button>
        
        <div 
          className="modal-hero"
          style={{ backgroundImage: `url(${movie.backdropUrl || movie.backdropPath || movie.posterUrl || ''})` }}
        >
          <div className="modal-hero-gradient"></div>
        </div>

        <div className="modal-info">
          <h1 className="modal-title">{movie.title}</h1>
          
          <div className="modal-actions">
            <button className="btn-modal-play" onClick={() => alert('Trailer playback coming soon!')}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
              Play
            </button>
            <button 
              className={`btn-modal-watchlist ${isInWatchlist ? 'in-watchlist' : ''}`}
              onClick={handleWatchlistClick}
              title={isInWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
            >
              {isInWatchlist ? '✓' : '+'}
            </button>
          </div>

          <div className="modal-details">
            <div>
              <div className="modal-meta">
                <span className="modal-match">{movie.rating ? `${movie.rating * 10}% Match` : 'New'}</span>
                <span>{movie.year || '2023'}</span>
                <span style={{ border: '1px solid #757575', padding: '0 0.4rem', borderRadius: '3px' }}>HD</span>
              </div>
              <p className="modal-desc">{movie.description || 'Watch this amazing title now on Netflix.'}</p>
            </div>
            
            <div className="modal-tags">
              <div>
                Genre: <span>{movie.genre || 'Various'}</span>
              </div>
              <div>
                Type: <span>{movie.type ? movie.type.charAt(0).toUpperCase() + movie.type.slice(1) : 'Movie'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieModal;
