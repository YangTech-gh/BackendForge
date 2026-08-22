import { Router, Request, Response } from 'express';
import { CreateProductSchema, UpdateProductSchema } from '../schemas/product.js';

export const productRoutes = Router();

interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  createdAt: string;
}

const products: Map<string, Product> = new Map();

productRoutes.get('/', (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const allProducts = Array.from(products.values());
  const start = (page - 1) * limit;
  const paginated = allProducts.slice(start, start + limit);

  res.json({
    data: paginated,
    pagination: {
      page,
      limit,
      total: allProducts.length,
      totalPages: Math.ceil(allProducts.length / limit),
    },
  });
});

productRoutes.get('/:id', (req: Request, res: Response) => {
  const product = products.get(req.params.id);
  if (!product) {
    return res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'Product not found' },
    });
  }
  res.json({ data: product });
});

productRoutes.post('/', (req: Request, res: Response) => {
  const parsed = CreateProductSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request body',
        details: parsed.error.flatten().fieldErrors,
      },
    });
  }
  const product: Product = {
    id: crypto.randomUUID(),
    ...parsed.data,
    createdAt: new Date().toISOString(),
  };
  products.set(product.id, product);
  res.status(201).json({ data: product });
});

productRoutes.put('/:id', (req: Request, res: Response) => {
  const existing = products.get(req.params.id);
  if (!existing) {
    return res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'Product not found' },
    });
  }
  const parsed = UpdateProductSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request body',
        details: parsed.error.flatten().fieldErrors,
      },
    });
  }
  const updated = { ...existing, ...parsed.data };
  products.set(req.params.id, updated);
  res.json({ data: updated });
});

productRoutes.delete('/:id', (req: Request, res: Response) => {
  const existing = products.get(req.params.id);
  if (!existing) {
    return res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'Product not found' },
    });
  }
  products.delete(req.params.id);
  res.status(204).send();
});
