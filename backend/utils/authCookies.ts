import type { Response } from 'express';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

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
    httpOnly: true,
    secure,
    sameSite,
    maxAge: ONE_DAY_MS,
    path: '/'
  };
};

export const setAuthCookie = (res: Response, token: string) => {
  res.cookie('auth_token', token, getCookieOptions());
};

export const clearAuthCookie = (res: Response) => {
  const sameSite = getSameSite();
  const isProduction = process.env.NODE_ENV === 'production';
  const secure = sameSite === 'none' ? true : isProduction;
  res.clearCookie('auth_token', {
    httpOnly: true,
    secure,
    sameSite,
    path: '/'
  });
};
