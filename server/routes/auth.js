import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getPool } from '../db/init.js';
import { Resend } from 'resend';
import crypto from 'crypto';

const router = express.Router();
const resend = new Resend(process.env.RESEND_API_KEY);

// Helper to send emails safely
const sendEmail = async (to, subject, html) => {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY is not set. Emails will not be sent!');
    return false;
  }
  try {
    await resend.emails.send({
      from: 'Netflix Clone <onboarding@resend.dev>', // Resend test email
      to,
      subject,
      html
    });
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
};

// 1. SIGNUP -> Creates user and logs them in instantly (No OTP)
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) return res.status(400).json({ error: 'All fields are required' });

    const pool = getPool();
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // New user (is_verified true by default now so they bypass old checks)
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (username, email, password_hash, is_verified) VALUES (?, ?, ?, true)',
      [username, email, hashedPassword]
    );

    // Log the user in securely right away
    const token = jwt.sign({ id: result.insertId, username }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: result.insertId, username, email } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// 2. VERIFY OTP (Kept just in case, but no longer used in signup flow)
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const pool = getPool();
    
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) return res.status(404).json({ error: 'User not found' });
    
    const user = users[0];
    
    if (user.otp_code !== otp) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }
    
    if (new Date() > new Date(user.otp_expires_at)) {
      return res.status(400).json({ error: 'Verification code has expired' });
    }

    // Mark as verified
    await pool.query('UPDATE users SET is_verified = true, otp_code = NULL, otp_expires_at = NULL WHERE email = ?', [email]);

    // Log the user in securely
    const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// 3. LOGIN (No longer checks if verified)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const pool = getPool();

    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    // Instantly log in without checking is_verified
    const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// 4. FORGOT PASSWORD
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const pool = getPool();
    
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      // Always return 200 for security reasons (don't leak if email exists)
      return res.json({ message: 'If that email exists, a reset link was sent.' });
    }

    // Generate secure token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await pool.query('UPDATE users SET reset_token = ?, reset_expires_at = ? WHERE email = ?', [resetToken, resetExpires, email]);

    const resetLink = `https://netflix-clone-uqrz.vercel.app/reset-password?token=${resetToken}`;
    
    await sendEmail(
      email,
      'Reset Your Netflix Clone Password',
      `<div style="font-family: sans-serif; padding: 20px;">
        <h1 style="color: #e50914;">Password Reset</h1>
        <p>You requested a password reset. Click the link below to set a new password:</p>
        <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #e50914; color: white; text-decoration: none; border-radius: 4px;">Reset Password</a>
        <br><br>
        <p>If the button above is blocked by Gmail, copy and paste this link into your browser:</p>
        <p><strong>${resetLink}</strong></p>
        <p>This link will expire in 1 hour.</p>
        <p>If you did not request this, please ignore this email.</p>
      </div>`
    );

    res.json({ message: 'If that email exists, a reset link was sent.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// 5. RESET PASSWORD
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const pool = getPool();

    const [users] = await pool.query('SELECT * FROM users WHERE reset_token = ?', [token]);
    if (users.length === 0) return res.status(400).json({ error: 'Invalid or expired reset token' });

    const user = users[0];
    if (new Date() > new Date(user.reset_expires_at)) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query(
      'UPDATE users SET password_hash = ?, reset_token = NULL, reset_expires_at = NULL WHERE id = ?',
      [hashedPassword, user.id]
    );

    res.json({ message: 'Password has been reset successfully. You can now log in.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ME ROUTE
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const pool = getPool();
    const [users] = await pool.query('SELECT id, username, email, is_verified FROM users WHERE id = ?', [decoded.id]);
    
    if (users.length === 0) return res.status(401).json({ error: 'User not found' });
    res.json({ user: users[0] });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;
