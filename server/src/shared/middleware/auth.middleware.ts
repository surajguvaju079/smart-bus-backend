import jwt from 'jsonwebtoken';
import { env } from '@config/env';
import { AsyncHandler } from '../types';
import { NextFunction } from 'express';
import { UserRole } from '../types/auth';
import { ref } from 'process';
import { success } from 'zod';

export const Authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers['authorization'];
  console.log('=== AUTH DEBUG ===');
  console.log('All headers:', req.headers);
  console.log('Auth header:', authHeader);
  console.log('==================');
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Invalid authorization format. Use: Bearer <token>',
    });
  }

  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, error: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
};

export const AuthorizeRoles =
  (...alllowedRoles: UserRole[]) =>
  (req, res, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'User not Authenticated' });
    }

    if (!alllowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: 'Access Denied' });
    }
    next();
  };

export const generateAuthToken = (userId: number, email: string, role: string): string => {
  const payload = { userId, role, email };
  if (!env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  const access_token = jwt.sign(payload, env.JWT_SECRET, { expiresIn: '1h' });
  return access_token;
};

export const generateRefreshToken = (userId: number): string => {
  const payload = { userId };
  const refresh_token = jwt.sign(payload, env.JWT_SECRET, { expiresIn: '7d' });
  return refresh_token;
};

export const refreshAccessToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      error: 'Refresh token is required',
    });
  }
  try {
    const decoded = jwt.verify(refreshToken, env.JWT_SECRET) as any;
    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        success: false,
        error: 'Invalid refresh token',
      });
    }

    //Fetch user if needed
    //const
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired refresh token',
    });
  }
};
