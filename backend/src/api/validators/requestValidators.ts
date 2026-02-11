import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { SearchRequestSchema, CheckoutRequestSchema } from '../../domain/validators/schemas';

export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      next(result.error);
      return;
    }

    req.body = result.data;
    next();
  };
}

export const validateSearchRequest = validateBody(SearchRequestSchema);
export const validateCheckoutRequest = validateBody(CheckoutRequestSchema);
