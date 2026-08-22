import express from 'express';
import swaggerUi from 'swagger-ui-express';
import yaml from 'yaml';
import fs from 'node:fs';
import path from 'node:path';
import { productRoutes } from './routes/products.js';

const app = express();
app.use(express.json());

const spec = yaml.parse(
  fs.readFileSync(path.resolve('openapi.yaml'), 'utf8')
);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(spec));

app.use('/api/v1/products', productRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API Blueprint server running on http://localhost:${PORT}`);
  console.log(`Swagger docs at http://localhost:${PORT}/docs`);
});

export default app;
