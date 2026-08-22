import crypto from 'node:crypto';

const MASTER_KEY = Buffer.from(process.env.MASTER_KEY || '0123456789abcdef0123456789abcdef', 'hex');

export function encryptDataKey(): { encryptedKey: string; dataKey: Buffer } {
  const dataKey = crypto.randomBytes(32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', MASTER_KEY, iv);
  const encrypted = Buffer.concat([cipher.update(dataKey), cipher.final()]);
  const tag = cipher.getAuthTag();
  return { encryptedKey: `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`, dataKey };
}

export function encryptPayload(payload: Buffer, dataKey: Buffer): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', dataKey, iv);
  const encrypted = Buffer.concat([cipher.update(payload), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`;
}
