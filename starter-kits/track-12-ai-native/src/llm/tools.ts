import { z } from 'zod';

export const WeatherToolSchema = z.object({
  location: z.string().describe('City and state, e.g. San Francisco, CA'),
});

export const tools = [
  {
    name: 'get_weather',
    description: 'Get current weather for a location',
    parameters: WeatherToolSchema,
  },
];

export async function executeTool(name: string, args: Record<string, unknown>): Promise<string> {
  switch (name) {
    case 'get_weather':
      return `Weather in ${args.location}: 72F, sunny`;
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
