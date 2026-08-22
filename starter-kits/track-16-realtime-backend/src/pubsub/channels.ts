export function buildChannelName(tenantId: string, room: string): string {
  return `tenant:${tenantId}:room:${room}`;
}

export function buildUserChannel(userId: string): string {
  return `user:${userId}`;
}

export const CHANNELS = {
  GLOBAL: 'global',
  NOTIFICATIONS: 'notifications',
} as const;
