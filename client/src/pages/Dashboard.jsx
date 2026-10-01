import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import MovieCard from '../components/MovieCard';
import MovieModal from '../components/MovieModal';
import { API_URL } from '../config';
import '../styles/dashboard.css';
import '../styles/movies.css';

const Dashboard = () => {
  const [movies, setMovies] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const { user, token } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const moviesRes = await fetch(`${API_URL}/api/movies`);
        if (moviesRes.ok) {
          const data = await moviesRes.json();
          setMovies(data.movies || []);
        }

        if (token) {
          const wlRes = await fetch(`${API_URL}/api/watchlist`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (wlRes.ok) {
            const wlData = await wlRes.json();
            setWatchlist(wlData.watchlist || []);
          }
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleAddToWatchlist = async (movieId) => {
    try {
      const response = await fetch(`${API_URL}/api/watchlist`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ movieId })
      });
      if (response.ok) {
        setWatchlist(prev => [...prev, movieId]);
        showToast('Added to My Watchlist');
      }
    } catch (error) {
      console.error("Failed to add to watchlist", error);
    }
  };

  const handleRemoveFromWatchlist = async (movieId) => {
    try {
      const response = await fetch(`${API_URL}/api/watchlist/${movieId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setWatchlist(prev => prev.filter(id => id !== movieId));
        showToast('Removed from My Watchlist');
      }
    } catch (error) {
      console.error("Failed to remove from watchlist", error);
    }
  };

  const handleToggleWatchlist = (movieId) => {
    if (watchlist.includes(movieId)) {
      handleRemoveFromWatchlist(movieId);
    } else {
      handleAddToWatchlist(movieId);
    }
  };

  const handleCardClick = (movie) => {
    setSelectedMovie(movie);
  };

  const filteredMovies = movies.filter(movie => 
    movie.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const watchlistMovies = movies.filter(movie => 
    watchlist.includes(movie._id || movie.id)
  );

  if (loading) {
    return (
      <div className="dashboard">
        <Navbar />
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <Navbar />
      
      {toastMessage && (
        <div style={{ position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)', background: '#e50914', color: 'white', padding: '12px 24px', borderRadius: '4px', zIndex: 3000, fontWeight: 'bold', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
          {toastMessage}
        </div>
      )}

      <MovieModal 
        isOpen={!!selectedMovie} 
        movie={selectedMovie} 
        onClose={() => setSelectedMovie(null)} 
        isInWatchlist={selectedMovie ? watchlist.includes(selectedMovie._id || selectedMovie.id) : false}
        onToggleWatchlist={handleToggleWatchlist}
        isLoggedIn={true}
      />

      <div className="dashboard-header">
        <h1 className="dashboard-welcome">
          Welcome back, <span>{user?.username || 'User'}</span>
        </h1>
      </div>

      <div className="dashboard-section">
        <div className="dashboard-section-header">
          <h2 className="dashboard-section-title">My Watchlist</h2>
        </div>
        
        {watchlistMovies.length > 0 ? (
          <div className="watchlist-grid">
            {watchlistMovies.map(movie => (
              <div key={movie._id || movie.id} className="watchlist-card" style={{ cursor: 'pointer' }} onClick={() => handleCardClick(movie)}>
                <img src={movie.posterUrl || movie.posterPath || movie.imageUrl || 'https://via.placeholder.com/200x300?text=No+Image'} alt={movie.title} />
                <div className="watchlist-card-info">
                  <div className="watchlist-card-title">{movie.title}</div>
                  <div className="watchlist-card-meta">{movie.year || ''}</div>
                  <button 
                    className="btn-remove"
                    onClick={(e) => { e.stopPropagation(); handleRemoveFromWatchlist(movie._id || movie.id); }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="watchlist-empty">
            <div className="watchlist-empty-icon">🎬</div>
            <p>Your watchlist is empty. Add some movies to watch later!</p>
          </div>
        )}
      </div>

      <div className="dashboard-section">
        <div className="dashboard-section-header">
          <h2 className="dashboard-section-title">Browse All</h2>
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search movies..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="browse-grid">
          {filteredMovies.map(movie => (
            <MovieCard 
              key={movie._id || movie.id} 
              movie={movie} 
              isInWatchlist={watchlist.includes(movie._id || movie.id)}
              onToggleWatchlist={handleToggleWatchlist}
              onCardClick={handleCardClick}
              isLoggedIn={true}
            />
          ))}
          {filteredMovies.length === 0 && (
            <div style={{ color: 'var(--text-secondary)', gridColumn: '1 / -1', padding: '2rem 0' }}>
              No movies found matching "{searchQuery}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
