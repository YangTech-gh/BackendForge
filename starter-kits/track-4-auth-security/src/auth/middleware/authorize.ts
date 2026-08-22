import type { FastifyRequest, FastifyReply } from 'fastify';
import { verifyToken, type TokenPayload } from '../oauth2/tokens.js';
import { hasPermission } from '../rbac/roles.js';

declare module 'fastify' {
  interface FastifyRequest {
    user?: TokenPayload;
  }
}

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return reply.status(401).send({ error: { code: 'UNAUTHORIZED', message: 'Missing or invalid token' } });
  }
  try {
    const token = authHeader.slice(7);
    request.user = await verifyToken(token);
  } catch {
    return reply.status(401).send({ error: { code: 'UNAUTHORIZED', message: 'Invalid or expired token' } });
  }
}

export function authorize(...permissions: string[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.user) {
      return reply.status(401).send({ error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
    }
    const userRoles = request.user.roles || [];
    const allowed = permissions.some(p => userRoles.some(role => hasPermission(role, p)));
    if (!allowed) {
      return reply.status(403).send({ error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } });
    }
  };
}
