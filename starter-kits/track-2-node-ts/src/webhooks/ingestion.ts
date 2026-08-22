import crypto from 'node:crypto';

export interface WebhookPayload {
  id: string;
  type: string;
  data: Record<string, unknown>;
  timestamp: string;
}

export function verifySignature(
  payload: Buffer,
  signature: string,
  secret: string
): boolean {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}

export function generateSignature(
  payload: Buffer,
  secret: string
): string {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}
