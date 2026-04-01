import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export const validateRequest = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse({
        ...req.body,
        ...req.query,
        ...req.params,
      });
      req.body = parsed;
      next();
    } catch (error: any) {
      res.status(400).json({
        message: 'Validation error',
        errors: error.errors || error.message,
      });
    }
  };
};

export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req.body);
      req.body = parsed;
      next();
    } catch (error: any) {
      res.status(400).json({
        message: 'Request body validation failed',
        errors: error.errors,
      });
    }
  };
};
