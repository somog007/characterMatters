import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodSchema } from 'zod';

const publicIssues = (error: unknown) =>
  error instanceof ZodError
    ? error.issues.map(({ path, message }) => ({ path, message }))
    : [];

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
    } catch (error) {
      res.status(400).json({
        message: 'Validation error',
        errors: publicIssues(error),
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
    } catch (error) {
      res.status(400).json({
        message: 'Request body validation failed',
        errors: publicIssues(error),
      });
    }
  };
};
