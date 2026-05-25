process.env.SECRET_KEY ||= 'test-secret-key';
process.env.BACKEND_JWT_SECRET ||= process.env.SECRET_KEY;
process.env.BACKEND_SESSION_SECRET ||= process.env.SECRET_KEY;
process.env.BACKEND_ACCESS_TOKEN_ENCRYPTION_KEY ||= process.env.SECRET_KEY;
process.env.BACKEND_ACCESS_TOKEN_ENCRYPTION_IV ||= process.env.SECRET_KEY;
