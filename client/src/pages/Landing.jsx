import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import HeroBanner from '../components/HeroBanner';
import MovieRow from '../components/MovieRow';
import MovieModal from '../components/MovieModal';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';

const Landing = () => {
  const [movies, setMovies] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [featuredMovie, setFeaturedMovie] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const { user, token } = useAuth();

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await fetch(`${API_URL}/api/movies`);
        if (response.ok) {
          const data = await response.json();
          const moviesList = data.movies || [];
          setMovies(moviesList);
          
          if (moviesList.length > 0) {
            const randomIndex = Math.floor(Math.random() * moviesList.length);
            setFeaturedMovie(moviesList[randomIndex]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch movies", error);
      }
    };

    fetchMovies();
  }, []);

  useEffect(() => {
    const fetchWatchlist = async () => {
      if (user && token) {
        try {
          const response = await fetch(`${API_URL}/api/watchlist`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (response.ok) {
            const data = await response.json();
            setWatchlist(data.watchlist || []);
          }
        } catch (error) {
          console.error("Failed to fetch watchlist", error);
        }
      } else {
        setWatchlist([]);
      }
    };

    fetchWatchlist();
  }, [user, token]);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleToggleWatchlist = async (movieId) => {
    if (!user || !token) return;

    const isInWatchlist = watchlist.includes(movieId);
    
    try {
      if (isInWatchlist) {
        const response = await fetch(`${API_URL}/api/watchlist/${movieId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          setWatchlist(prev => prev.filter(id => id !== movieId));
          showToast('Removed from My Watchlist');
        }
      } else {
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
      }
    } catch (error) {
      console.error("Failed to toggle watchlist", error);
    }
  };

  const handleCardClick = (movie) => {
    setSelectedMovie(movie);
  };

  // Group movies by genre
  const genres = [...new Set(movies.map(m => m.genre).filter(Boolean))];
  
  return (
    <div style={{ backgroundColor: 'var(--bg-dark)', minHeight: '100vh', paddingBottom: '2rem' }}>
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
        isLoggedIn={!!user}
      />

      <HeroBanner movie={featuredMovie} />
      
      <div style={{ marginTop: '-80px', position: 'relative', zIndex: 3 }}>
        {movies.length > 0 && (
          <MovieRow 
            title="Trending Now" 
            movies={movies.slice(0, 10)} 
            watchlist={watchlist}
            onToggleWatchlist={handleToggleWatchlist}
            onCardClick={handleCardClick}
            isLoggedIn={!!user}
          />
        )}
        
        {genres.map(genre => (
          <MovieRow 
            key={genre}
            title={genre} 
            movies={movies.filter(m => m.genre === genre)} 
            watchlist={watchlist}
            onToggleWatchlist={handleToggleWatchlist}
            onCardClick={handleCardClick}
            isLoggedIn={!!user}
          />
        ))}
      </div>
    </div>
  );
};

export default Landing;
