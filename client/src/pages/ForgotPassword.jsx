import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { forgotPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setMessage('');
    
    const result = await forgotPassword(email);
    setIsSubmitting(false);

    if (result.success) {
      setMessage(result.message);
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-form-container">
        <h1 className="auth-form-title">Forgot Password</h1>
        
        {error && <div className="auth-error-message">{error}</div>}
        {message && <div className="auth-error-message" style={{ backgroundColor: 'rgba(46, 204, 113, 0.1)', borderColor: '#2ecc71', color: '#2ecc71' }}>{message}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input 
              type="email" 
              className="form-input" 
              placeholder=" " 
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); setMessage(''); }}
            />
            <label className="form-label">Email address</label>
          </div>
          
          <button type="submit" className="btn-submit" disabled={isSubmitting}>
            {isSubmitting ? 'Sending...' : 'Email Me'}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>Remembered your password? <Link to="/login">Sign In</Link></p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
