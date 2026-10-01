import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/auth.css';

const VerifyOTP = () => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyOtp } = useAuth();

  // Email is passed via router state from Signup or Login
  const email = location.state?.email;

  if (!email) {
    navigate('/login');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otp) {
      setError('Please enter the verification code.');
      return;
    }

    setIsSubmitting(true);
    const result = await verifyOtp(email, otp);
    setIsSubmitting(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Invalid code.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-form-container">
        <h1 className="auth-form-title">Verify Email</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          We sent a 6-digit verification code to <strong>{email}</strong>.
        </p>

        {error && <div className="auth-error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input 
              type="text" 
              className="form-input" 
              placeholder=" " 
              value={otp}
              onChange={(e) => { setOtp(e.target.value); setError(''); }}
              maxLength="6"
            />
            <label className="form-label">6-Digit Code</label>
          </div>
          
          <button type="submit" className="btn-submit" disabled={isSubmitting}>
            {isSubmitting ? 'Verifying...' : 'Verify'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyOTP;
