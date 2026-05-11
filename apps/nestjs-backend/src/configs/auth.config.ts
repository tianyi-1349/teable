/* eslint-disable @typescript-eslint/naming-convention */
import { Inject } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { registerAs } from '@nestjs/config';

const getCookieSecure = (value: string | undefined) => {
  if (!value) {
    return undefined;
  }
  if (value === 'auto') {
    return 'auto' as const;
  }
  return value === 'true';
};

const requireEnv = (env: string | undefined, name: string): string => {
  if (!env) {
    throw new Error(
      `Security: required environment variable ${name} is not set. Refusing to start with insecure defaults.`
    );
  }
  return env;
};

export const authConfig = registerAs('auth', () => ({
  jwt: {
    secret: requireEnv(
      process.env.BACKEND_JWT_SECRET ?? process.env.SECRET_KEY,
      'BACKEND_JWT_SECRET or SECRET_KEY'
    ),
    expiresIn: process.env.BACKEND_JWT_EXPIRES_IN ?? '20d',
  },
  session: {
    secret: requireEnv(
      process.env.BACKEND_SESSION_SECRET ?? process.env.SECRET_KEY,
      'BACKEND_SESSION_SECRET or SECRET_KEY'
    ),
    expiresIn: process.env.BACKEND_SESSION_EXPIRES_IN ?? '7d',
    cookie: {
      secure: getCookieSecure(process.env.BACKEND_SESSION_COOKIE_SECURE),
    },
  },
  accessToken: {
    prefix: 'teable',
    encryption: {
      algorithm: process.env.BACKEND_ACCESS_TOKEN_ENCRYPTION_ALGORITHM ?? 'aes-128-cbc',
      key: requireEnv(
        process.env.BACKEND_ACCESS_TOKEN_ENCRYPTION_KEY ?? process.env.SECRET_KEY,
        'BACKEND_ACCESS_TOKEN_ENCRYPTION_KEY or SECRET_KEY'
      ),
      iv: requireEnv(
        process.env.BACKEND_ACCESS_TOKEN_ENCRYPTION_IV ?? process.env.SECRET_KEY,
        'BACKEND_ACCESS_TOKEN_ENCRYPTION_IV or SECRET_KEY'
      ),
    },
  },
  resetPasswordEmailExpiresIn:
    process.env.BACKEND_EMAIL_CODE_EXPIRES_IN ??
    process.env.BACKEND_RESET_PASSWORD_EMAIL_EXPIRES_IN ??
    '30m',
  signupVerificationExpiresIn:
    process.env.BACKEND_EMAIL_CODE_EXPIRES_IN ??
    process.env.BACKEND_SIGNUP_VERIFICATION_EXPIRES_IN ??
    '30m',
  socialAuthProviders: process.env.SOCIAL_AUTH_PROVIDERS?.split(',') ?? [],
  github: {
    clientID: process.env.BACKEND_GITHUB_CLIENT_ID,
    clientSecret: process.env.BACKEND_GITHUB_CLIENT_SECRET,
    callbackURL: process.env.BACKEND_GITHUB_CALLBACK_URL,
  },
  google: {
    clientID: process.env.BACKEND_GOOGLE_CLIENT_ID,
    clientSecret: process.env.BACKEND_GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.BACKEND_GOOGLE_CALLBACK_URL,
  },
  oidc: {
    issuer: process.env.BACKEND_OIDC_ISSUER,
    authorizationURL: process.env.BACKEND_OIDC_AUTHORIZATION_URL,
    tokenURL: process.env.BACKEND_OIDC_TOKEN_URL,
    userInfoURL: process.env.BACKEND_OIDC_USER_INFO_URL,
    clientID: process.env.BACKEND_OIDC_CLIENT_ID,
    clientSecret: process.env.BACKEND_OIDC_CLIENT_SECRET,
    callbackURL: process.env.BACKEND_OIDC_CALLBACK_URL,
    other: process.env.BACKEND_OIDC_OTHER ? JSON.parse(process.env.BACKEND_OIDC_OTHER) : {},
  },
  signin: {
    maxLoginAttempts: process.env.SIGNIN_MAX_LOGIN_ATTEMPTS
      ? Number(process.env.SIGNIN_MAX_LOGIN_ATTEMPTS)
      : undefined,
    accountLockoutMinutes: process.env.SIGNIN_ACCOUNT_LOCKOUT_MINUTES
      ? Number(process.env.SIGNIN_ACCOUNT_LOCKOUT_MINUTES)
      : undefined,
  },
}));

export const AuthConfig = () => Inject(authConfig.KEY);

export type IAuthConfig = ConfigType<typeof authConfig>;
