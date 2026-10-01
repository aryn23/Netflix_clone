import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/auth.css';

const SignUp = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    const result = await signup(formData.username, formData.email, formData.password);
    setIsSubmitting(false);
    
    if (result.success) {
      navigate('/verify-otp', { state: { email: formData.email } });
    } else {
      setApiError(result.error || 'Failed to sign up. Please try again.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-form-container">
        <h1 className="auth-form-title">Sign Up</h1>
        
        {apiError && <div className="auth-error-message">{apiError}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input 
              type="text" 
              name="username"
              id="username"
              className="form-input" 
              placeholder=" " 
              value={formData.username}
              onChange={handleChange}
            />
            <label htmlFor="username" className="form-label">Username</label>
            {errors.username && <div className="form-error">{errors.username}</div>}
          </div>
          
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
            <label htmlFor="email" className="form-label">Email address</label>
            {errors.email && <div className="form-error">{errors.email}</div>}
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
            {errors.password && <div className="form-error">{errors.password}</div>}
          </div>
          
          <div className="form-group">
            <input 
              type="password" 
              name="confirmPassword"
              id="confirmPassword"
              className="form-input" 
              placeholder=" " 
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
            {errors.confirmPassword && <div className="form-error">{errors.confirmPassword}</div>}
          </div>
          
          <button type="submit" className="btn-submit" disabled={isSubmitting}>
            {isSubmitting ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>Already have an account? <Link to="/login">Sign In</Link></p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
