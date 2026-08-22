import crypto from 'node:crypto';

const tokens = new Map<string, string>();

export function tokenize(cardNumber: string): string {
  const token = `tok_${crypto.randomBytes(16).toString('hex')}`;
  tokens.set(token, cardNumber);
  return token;
}

export function detokenize(token: string): string | null {
  return tokens.get(token) || null;
}

export function maskCard(cardNumber: string): string {
  return `****-****-****-${cardNumber.slice(-4)}`;
}
