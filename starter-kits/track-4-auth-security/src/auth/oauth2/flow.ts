import crypto from 'node:crypto';

export interface PKCEPair {
  codeVerifier: string;
  codeChallenge: string;
}

export function generatePKCEPair(): PKCEPair {
  const codeVerifier = base64url(crypto.randomBytes(32));
  const codeChallenge = base64url(
    crypto.createHash('sha256').update(codeVerifier).digest()
  );
  return { codeVerifier, codeChallenge };
}

export function generateState(): string {
  return base64url(crypto.randomBytes(32));
}

export function buildAuthorizationUrl(options: {
  authorizationEndpoint: string;
  clientId: string;
  redirectUri: string;
  codeChallenge: string;
  state: string;
  scope?: string[];
}): string {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: options.clientId,
    redirect_uri: options.redirectUri,
    code_challenge: options.codeChallenge,
    code_challenge_method: 'S256',
    state: options.state,
    scope: (options.scope || ['openid', 'profile']).join(' '),
  });
  return `${options.authorizationEndpoint}?${params.toString()}`;
}

function base64url(buffer: Buffer): string {
  return buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}
