import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { JWT_SECRET } from '../config/env.js';

const USER_CACHE_TTL_MS = 60 * 1000;
const USER_CACHE_MAX = 500;
const userCache = new Map();

const getCachedUser = (id) => {
  const entry = userCache.get(id);
  if (!entry) return null;
  if (Date.now() - entry.cachedAt > USER_CACHE_TTL_MS) {
    userCache.delete(id);
    return null;
  }
  return entry.user;
};

const setCachedUser = (id, user) => {
  if (userCache.size >= USER_CACHE_MAX) {
    userCache.delete(userCache.keys().next().value);
  }
  userCache.set(id, { user, cachedAt: Date.now() });
};

export const invalidateUserCache = (id) => userCache.delete(String(id));

export const protect = async (req, res, next) => {
  let token;

  if (req.cookies.jwt) {
    token = req.cookies.jwt;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const id = String(decoded.id);

    let user = getCachedUser(id);
    if (!user) {
      user = await User.findById(id).select('-password');
      if (user) setCachedUser(id, user);
    }

    if (!user) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};


export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as an admin' });
  }
};

export const generateToken = (id) => {
  if (!JWT_SECRET) {
    throw new Error('JWT secret not configured');
  }
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '7d' });
};

export const setTokenCookie = (res, token) => {
  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  };

  res.cookie('jwt', token, cookieOptions);
};

export const clearTokenCookie = (res) => {
  res.cookie('jwt', '', {
    expires: new Date(0),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  });
};
