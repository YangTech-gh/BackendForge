import { searchSimilar } from './embeddings.js';

export async function ragQuery(question: string, questionEmbedding: number[]): Promise<{
  context: string[];
  answer: string;
}> {
  const results = await searchSimilar(questionEmbedding, 5);
  const context = results.map((r: any) => r.content);

  const prompt = `Based on the following context, answer the question.\n\nContext:\n${context.join('\n\n')}\n\nQuestion: ${question}\n\nAnswer:`;

  return { context, answer: prompt };
}
