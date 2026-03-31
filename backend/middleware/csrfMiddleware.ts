import crypto from 'crypto';
import type { Request, Response, NextFunction } from 'express';

const CSRF_COOKIE = 'XSRF-TOKEN';
const CSRF_HEADER = 'x-csrf-token';
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

const getSameSite = () => {
  const configured = (process.env.COOKIE_SAMESITE || 'lax').toLowerCase();
  if (configured === 'none') return 'none' as const;
  if (configured === 'strict') return 'strict' as const;
  return 'lax' as const;
};

const getCookieOptions = () => {
  const sameSite = getSameSite();
  const isProduction = process.env.NODE_ENV === 'production';
  const secure = sameSite === 'none' ? true : isProduction;
  return {
    httpOnly: false,
    secure,
    sameSite,
    path: '/'
  };
};

const ensureCsrfCookie = (req: Request, res: Response) => {
  if (!req.cookies?.[CSRF_COOKIE]) {
    const token = crypto.randomBytes(32).toString('hex');
    res.cookie(CSRF_COOKIE, token, getCookieOptions());
    return token;
  }
  return req.cookies[CSRF_COOKIE];
};

export const csrfMiddleware = (req: Request, res: Response, next: NextFunction) => {
  ensureCsrfCookie(req, res);

  if (SAFE_METHODS.has(req.method)) {
    return next();
  }

  // Skip CSRF checks for API key auth or bearer token usage without cookies
  if (req.headers['x-api-key']) {
    return next();
  }

  const authCookie = req.cookies?.auth_token;
  if (!authCookie) {
    return next();
  }

  const headerToken = req.headers[CSRF_HEADER] as string | undefined;
  const cookieToken = req.cookies?.[CSRF_COOKIE];

  if (!headerToken || !cookieToken || headerToken !== cookieToken) {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }

  return next();
};
