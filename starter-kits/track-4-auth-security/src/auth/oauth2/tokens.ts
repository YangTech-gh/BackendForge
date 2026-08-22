import { SignJWT, jwtVerify, type JWTPayload } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret-change-in-production');

export interface TokenPayload extends JWTPayload {
  sub: string;
  email: string;
  roles: string[];
}

export async function createAccessToken(payload: Omit<TokenPayload, 'iat' | 'exp' | 'iss'>): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer('backend-forge')
    .setExpirationTime('15m')
    .sign(secret);
}

export async function createRefreshToken(payload: Omit<TokenPayload, 'iat' | 'exp' | 'iss'>): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer('backend-forge')
    .setExpirationTime('7d')
    .sign(secret);
}

export async function verifyToken(token: string): Promise<TokenPayload> {
  const { payload } = await jwtVerify(token, secret, { issuer: 'backend-forge' });
  return payload as TokenPayload;
}

export async function rotateRefreshToken(oldRefreshToken: string): Promise<{
  accessToken: string;
  refreshToken: string;
} | null> {
  try {
    const payload = await verifyToken(oldRefreshToken);
    const accessToken = await createAccessToken({
      sub: payload.sub,
      email: payload.email,
      roles: payload.roles,
    });
    const refreshToken = await createRefreshToken({
      sub: payload.sub,
      email: payload.email,
      roles: payload.roles,
    });
    return { accessToken, refreshToken };
  } catch {
    return null;
  }
}
