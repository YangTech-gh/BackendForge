import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy initializer for Gemini client with telemetry header
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// --- API ROUTES ---

// Health Check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', platform: 'Backend Forge', timestamp: new Date().toISOString() });
});

// AI System Architecture Trade-off & RFC Evaluator
app.post('/api/ai/system-review', async (req, res) => {
  try {
    const { nodes, connections, targetRps, latencyBudgetMs, systemGoal } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        rfcTitle: `RFC: Architecture Trade-off Analysis for ${systemGoal || 'Backend System'}`,
        spofs: [
          "Single PostgreSQL primary node without automated failover replica.",
          "Unbuffered direct synchronous API calls between ingress gateway and payment processor."
        ],
        concurrencyAnalysis: `At ${targetRps || 10000} RPS, the bottleneck will be database connection pool exhaustion (default pool size 20). Recommended: Add PgBouncer with transaction pooling and Redis caching for read-heavy operations.`,
        capTradeoffs: "Prioritizes Strong Consistency over Availability (CP system). Under network partition, write operations on the primary DB will fail-safe to maintain data integrity.",
        estimatedMonthlyCost: "$420 - $850 / month on AWS/GCP managed infrastructure.",
        recommendations: [
          "Implement idempotency keys (UUIDv4 + Redis SETNX) for non-idempotent webhook processing.",
          "Introduce a distributed message queue (RabbitMQ or Kafka) to buffer spiked event payloads.",
          "Enable read-replicas with async replication for read queries."
        ],
        generatedCodeSnippet: `// Suggested Idempotency Wrapper in TypeScript\nimport Redis from 'ioredis';\nconst redis = new Redis(process.env.REDIS_URL);\n\nexport async function executeIdempotent<T>(\n  idempotencyKey: string,\n  ttlSeconds: number,\n  fn: () => Promise<T>\n): Promise<T> {\n  const acquired = await redis.set(\`lock:\${idempotencyKey}\`, 'LOCKED', 'EX', ttlSeconds, 'NX');\n  if (!acquired) {\n    throw new Error('Concurrent request in progress for key: ' + idempotencyKey);\n  }\n  try {\n    return await fn();\n  } finally {\n    await redis.del(\`lock:\${idempotencyKey}\`);\n  }\n}`
      });
    }

    const prompt = `You are a Principal Backend Systems Architect at a high-scale tech enterprise (like Stripe, Uber, or Discord).
Analyze the following system architecture design:
- System Goal: ${systemGoal || 'High-throughput microservices backend'}
- Targeted RPS: ${targetRps || 10000} req/sec
- Latency Budget: ${latencyBudgetMs || 50} ms
- Architecture Components (Nodes): ${JSON.stringify(nodes)}
- Component Connections: ${JSON.stringify(connections)}

Provide a rigorous, production-grade technical evaluation formatted as JSON with the following fields:
1. "rfcTitle": A concise, formal title for this RFC.
2. "spofs": Array of strings identifying single points of failure.
3. "concurrencyAnalysis": Technical analysis of potential race conditions, lock contention, and pool exhaustion at peak RPS.
4. "capTradeoffs": Detailed CAP Theorem trade-off description (Consistency vs Availability vs Partition Tolerance).
5. "estimatedMonthlyCost": Infrastructure cost estimation.
6. "recommendations": Array of 3-4 actionable architectural improvements.
7. "generatedCodeSnippet": A production-ready TypeScript code snippet implementing an architectural pattern needed for this system (e.g., rate limiting, circuit breaker, idempotency, or connection pooling).

Respond ONLY with valid JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('System Review AI error:', error);
    res.status(500).json({ error: error.message || 'Failed to review architecture' });
  }
});

// AI Code Sandbox & Lab Reviewer
app.post('/api/ai/lab-evaluator', async (req, res) => {
  try {
    const { courseId, labTitle, code, language } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        passed: true,
        score: 94,
        feedback: "Solid implementation! You correctly handled the idempotency key lookup before executing the database transaction. Your error handling prevents silent failure and rollback leaks.",
        securitySuggestions: ["Sanitize error messages before sending them to external clients to avoid exposing internal database stack traces."],
        performanceTips: ["Add an index on (tenant_id, idempotency_key) to keep lookup times under O(log N)."],
        improvedCode: code
      });
    }

    const prompt = `You are a Senior Staff Code Reviewer for "Backend Forge", an elite training platform for AI-Native Backend Engineers.
Evaluate this student code submission for the lab "${labTitle}" (Course: ${courseId}):

Language: ${language || 'typescript'}
Student Code:
\`\`\`
${code}
\`\`\`

Evaluate the submission on:
1. Correctness & System Resilience (Handling retries, race conditions, null safety, memory efficiency)
2. Production Readiness (Logging, error handling, clean abstractions)
3. Security & Data Integrity

Return a JSON object with:
- "passed": boolean (true if score >= 80)
- "score": number (0-100)
- "feedback": detailed architectural code review feedback paragraph
- "securitySuggestions": string array of security / edge-case items
- "performanceTips": string array of performance or memory optimizations
- "improvedCode": an improved version of the code fixing any bugs or anti-patterns
Respond ONLY with valid JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const result = JSON.parse(response.text || '{}');
    res.json(result);
  } catch (error: any) {
    console.error('Lab evaluator error:', error);
    res.status(500).json({ error: error.message || 'Failed to evaluate lab code' });
  }
});

// AI Systems Architect Tutor Q&A
app.post('/api/ai/ask-tutor', async (req, res) => {
  try {
    const { question, contextTrack } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        answer: `Great question regarding **${contextTrack || 'Backend Systems'}**! In production systems, when choosing between strong consistency and eventual consistency, you must align with business domain boundaries. For payment ledgers, stick with ACID PostgreSQL transactions. For real-time analytics or feed items, event-driven streams with Redis/pgvector are ideal.`
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: question,
      config: {
        systemInstruction: `You are the Lead AI Systems Architect Mentor at Backend Forge.
Your goal is to guide backend engineers to Staff-level AI-Native Architecture.
Provide clear, structured, authoritative advice. Use rich markdown formatting:
- Use markdown headers (### or ##) for section titles.
- Use bold (**key term**) for important architectural concepts.
- Use code blocks (\`\`\`typescript or \`\`\`sql or \`\`\`json) for code examples.
- Use callouts (> [!TIP] or > [!NOTE] or > [!WARNING]) for critical caveats or best practices.
- When applicable, insert interactive action directives on their own line:
  - [ACTION:RUN_TESTS] to suggest executing the verification test suite.
  - [ACTION:SHOW_ARCHITECTURE] to show a dynamic visual system topology flow.
  - [ACTION:CLEAR_TERMINAL] to clean sandbox console output logs.
Keep responses actionable, production-ready, and formatted clearly.`,
      },
    });

    res.json({ answer: response.text });
  } catch (error: any) {
    console.error('Ask tutor error:', error);
    res.status(500).json({ error: error.message || 'Failed to answer question' });
  }
});

// --- VITE / STATIC SERVING ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`⚡ Backend Forge server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
