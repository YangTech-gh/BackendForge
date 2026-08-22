export interface Command {
  type: string;
  payload: Record<string, unknown>;
}

export type CommandHandler = (command: Command) => Promise<void>;

const handlers = new Map<string, CommandHandler>();

export function registerCommandHandler(type: string, handler: CommandHandler) {
  handlers.set(type, handler);
}

export async function dispatch(command: Command): Promise<void> {
  const handler = handlers.get(command.type);
  if (!handler) throw new Error(`No handler for command: ${command.type}`);
  await handler(command);
}
