import { createHmac } from 'crypto';
import { baseConfig } from '../configs/base.config';

export const generateInvitationCode = (invitationId: string) => {
  const key = baseConfig().secretKey;
  if (!key) {
    throw new Error('SECRET_KEY is required for invitation code generation');
  }
  const hmac = createHmac('sha256', key);
  return hmac.update(invitationId).digest('hex');
};
