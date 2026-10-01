import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError('Please enter both email and password.');
      return;
    }
    
    setIsSubmitting(true);
    const result = await login(formData.email, formData.password);
    setIsSubmitting(false);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Invalid email or password.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-form-container">
        <h1 className="auth-form-title">Sign In</h1>
        
        {error && <div className="auth-error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input 
              type="email" 
              name="email"
              id="email"
              className="form-input" 
              placeholder=" " 
              value={formData.email}
              onChange={handleChange}
            />
            <label htmlFor="email" className="form-label">Email or phone number</label>
          </div>
          
          <div className="form-group">
            <input 
              type="password" 
              name="password"
              id="password"
              className="form-input" 
              placeholder=" " 
              value={formData.password}
              onChange={handleChange}
            />
            <label htmlFor="password" className="form-label">Password</label>
          </div>
          
          <button type="submit" className="btn-submit" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
          
          <div className="remember-me">
            <input 
              type="checkbox" 
              id="rememberMe" 
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
            />
            <label htmlFor="rememberMe">Remember me</label>
          </div>
        </form>
        
        <div className="auth-footer">
          <p>New to Netflix? <Link to="/signup">Sign up now</Link>.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
