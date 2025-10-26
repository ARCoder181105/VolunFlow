import { Router, Response } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../services/prisma.service.js';
import { hashPassword, comparePassword, generateAndStoreTokens } from '../services/auth.service.js';
import passport from '../config/passport.js';

const router = Router();
const CLIENT_URL = process.env.CLIENT_URL as string;
// Use the specific secret for verifying refresh tokens
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET as string;

// --- Helper Function for setting cookies ---
const setAuthCookies = (res: Response, accessToken: string, refreshToken: string) => {
  // Correctly calculate maxAge in milliseconds
  const accessTokenMaxAge = 1 * 24 * 60 * 60 * 1000; // 1 day
  const refreshTokenMaxAge = 7 * 24 * 60 * 60 * 1000; // 7 days

  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: accessTokenMaxAge,
  });
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/api/v1/auth/refresh_token',
    maxAge: refreshTokenMaxAge,
  });
};

// --- Manual Email/Password Routes ---

// POST /api/v1/auth/register
router.post('/register', async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ message: 'Email, password, and name are required.' });
  }
  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'User with this email already exists.' });
    }
    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: { email, name, password: hashedPassword, authProvider: 'EMAIL' },
    });
    const { accessToken, refreshToken } = await generateAndStoreTokens(user);
    setAuthCookies(res, accessToken, refreshToken);
    const { password: _, refreshToken: __, ...userResponse } = user;
    res.status(201).json(userResponse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during registration.' });
  }
});

// POST /api/v1/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      return res.status(401).json({ message: 'Invalid credentials or user signed up with OAuth.' });
    }
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    const { accessToken, refreshToken } = await generateAndStoreTokens(user);
    setAuthCookies(res, accessToken, refreshToken);
    const { password: _, refreshToken: __, ...userResponse } = user;
    res.status(200).json(userResponse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

// --- Token Management Routes ---

// POST /api/v1/auth/refresh_token
router.post('/refresh_token', async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken;
  if (!incomingRefreshToken) {
    return res.status(401).json({ message: 'No refresh token provided.' });
  }
  try {
    // Verify the token with its specific secret
    const payload = jwt.verify(incomingRefreshToken, REFRESH_TOKEN_SECRET) as { id: string };
    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user || !user.refreshToken) {
      return res.status(403).json({ message: 'Invalid refresh token or session revoked.' });
    }
    const isTokenValid = await comparePassword(incomingRefreshToken, user.refreshToken);
    if (!isTokenValid) {
      return res.status(403).json({ message: 'Invalid refresh token.' });
    }
    const { accessToken, refreshToken } = await generateAndStoreTokens(user);
    setAuthCookies(res, accessToken, refreshToken);
    res.status(200).json({ message: 'Token refreshed successfully.' });
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired refresh token.' });
  }
});

// POST /api/v1/auth/logout
router.post('/logout', async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken;
  if (incomingRefreshToken) {
    try {
      // Verify the token with its specific secret before proceeding
      const payload = jwt.verify(incomingRefreshToken, REFRESH_TOKEN_SECRET) as { id: string };
      await prisma.user.update({
        where: { id: payload.id },
        data: { refreshToken: null },
      });
    } catch (error) {
      // Ignore errors if token is invalid, just clear cookies
    }
  }
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken', { path: '/api/v1/auth/refresh_token' });
  res.status(200).json({ message: 'Logged out successfully.' });
});

// --- OAuth Routes ---

// GET /api/v1/auth/google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// GET /api/v1/auth/google/callback
router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: `${CLIENT_URL}/login` }), async (req, res) => {
  const user = req.user as any;
  const { accessToken, refreshToken } = await generateAndStoreTokens(user);
  setAuthCookies(res, accessToken, refreshToken);
  res.redirect(`${CLIENT_URL}/dashboard`);
});

// GET /api/v1/auth/facebook
router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));

// GET /api/v1/auth/facebook/callback
router.get('/facebook/callback', passport.authenticate('facebook', { session: false, failureRedirect: `${CLIENT_URL}/login` }), async (req, res) => {
  const user = req.user as any;
  const { accessToken, refreshToken } = await generateAndStoreTokens(user);
  setAuthCookies(res, accessToken, refreshToken);
  res.redirect(`${CLIENT_URL}/dashboard`);
});

export default router;