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

const REQUIRED_SECRET_MSG =
  'FATAL: SECRET_KEY (or BACKEND_JWT_SECRET / BACKEND_SESSION_SECRET) must be set. Insecure hardcoded defaults have been removed.';

const REQUIRED_TOKEN_ENC_MSG =
  'FATAL: BACKEND_ACCESS_TOKEN_ENCRYPTION_KEY and BACKEND_ACCESS_TOKEN_ENCRYPTION_IV must be set. Insecure hardcoded defaults have been removed.';

const requireSecret = (value: string | undefined, msg: string): string => {
  if (!value) throw new Error(msg);
  return value;
};

const parseOidcOther = (raw: string | undefined): Record<string, unknown> => {
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
};

export const authConfig = registerAs('auth', () => {
  const secretKey = process.env.SECRET_KEY;
  const jwtSecret = requireSecret(process.env.BACKEND_JWT_SECRET ?? secretKey, REQUIRED_SECRET_MSG);
  const sessionSecret = requireSecret(
    process.env.BACKEND_SESSION_SECRET ?? secretKey,
    REQUIRED_SECRET_MSG
  );

  const accessTokenKey = process.env.BACKEND_ACCESS_TOKEN_ENCRYPTION_KEY;
  const accessTokenIv = process.env.BACKEND_ACCESS_TOKEN_ENCRYPTION_IV;
  if (!accessTokenKey || !accessTokenIv) {
    throw new Error(REQUIRED_TOKEN_ENC_MSG);
  }

  const oidcOther = parseOidcOther(process.env.BACKEND_OIDC_OTHER);

  return {
    jwt: {
      secret: jwtSecret,
      expiresIn: process.env.BACKEND_JWT_EXPIRES_IN ?? '20d',
    },
    session: {
      secret: sessionSecret,
      expiresIn: process.env.BACKEND_SESSION_EXPIRES_IN ?? '7d',
      cookie: {
        secure: getCookieSecure(process.env.BACKEND_SESSION_COOKIE_SECURE),
      },
    },
    accessToken: {
      prefix: 'teable',
      encryption: {
        algorithm: process.env.BACKEND_ACCESS_TOKEN_ENCRYPTION_ALGORITHM ?? 'aes-128-cbc',
        key: accessTokenKey,
        iv: accessTokenIv,
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
      other: oidcOther,
    },
    signin: {
      maxLoginAttempts: process.env.SIGNIN_MAX_LOGIN_ATTEMPTS
        ? Number(process.env.SIGNIN_MAX_LOGIN_ATTEMPTS)
        : undefined,
      accountLockoutMinutes: process.env.SIGNIN_ACCOUNT_LOCKOUT_MINUTES
        ? Number(process.env.SIGNIN_ACCOUNT_LOCKOUT_MINUTES)
        : undefined,
    },
  };
});

export const AuthConfig = () => Inject(authConfig.KEY);

export type IAuthConfig = ConfigType<typeof authConfig>;
