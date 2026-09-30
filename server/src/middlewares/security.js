import rateLimit from 'express-rate-limit';
import { validationResult } from 'express-validator';
import { FRONTEND_ORIGIN } from '../config/env.js';

export const limiter = rateLimit({
    windowMs: (Number(process.env.RATE_LIMIT_WINDOW) || 15) * 60 * 1000,
    max: Number(process.env.RATE_LIMIT_MAX) || 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: "Too many requests, please try again later."
    }
});

export const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

const allowedOrigins = (FRONTEND_ORIGIN || '').split(',').map(origin => origin.trim().replace(/\/$/, ''));
if (allowedOrigins.length === 0 || allowedOrigins.every(o => !o)) {
    throw new Error('[CORS] FRONTEND_ORIGIN is required (comma-separated if multiple).');
}
console.log('[CORS] Allowed origins:', allowedOrigins);

export const corsOptions = {
    origin(origin, callback) {
        if (!origin) return callback(null, true); // non-browser
        const cleaned = origin.replace(/\/$/, '');
        if (allowedOrigins.includes(cleaned)) return callback(null, true);

        console.warn(`[CORS] Blocked origin: ${origin}`);
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 86400
};
