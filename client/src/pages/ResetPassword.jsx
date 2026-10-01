import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/auth.css';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { resetPassword } = useAuth();

  // Get token from URL (e.g. /reset-password?token=XYZ)
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) {
      setError('Please enter a new password.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    
    const result = await resetPassword(token, password);
    setIsSubmitting(false);

    if (result.success) {
      setMessage(result.message);
      // Optional: Auto redirect to login after a few seconds
      setTimeout(() => navigate('/login'), 3000);
    } else {
      setError(result.error);
    }
  };

  if (!token) {
    return (
      <div className="auth-page">
        <div className="auth-form-container">
          <h1 className="auth-form-title">Invalid Link</h1>
          <div className="auth-error-message">This password reset link is invalid or has expired.</div>
          <div className="auth-footer"><Link to="/login">Go to Sign In</Link></div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-form-container">
        <h1 className="auth-form-title">Reset Password</h1>
        
        {error && <div className="auth-error-message">{error}</div>}
        {message && <div className="auth-error-message" style={{ backgroundColor: 'rgba(46, 204, 113, 0.1)', borderColor: '#2ecc71', color: '#2ecc71' }}>{message}</div>}

        {!message && (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input 
                type="password" 
                className="form-input" 
                placeholder=" " 
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
              />
              <label className="form-label">New Password</label>
            </div>
            
            <button type="submit" className="btn-submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save New Password'}
            </button>
          </form>
        )}
        
        <div className="auth-footer">
          <Link to="/login">Back to Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
