import { Request, Response, NextFunction } from 'express';

// Standard error format
export interface AppError extends Error {
  statusCode?: number;
}

export const errorHandler = (err: AppError, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Log error to console (or logging service) in development
  console.error(`[Error] ${statusCode} - ${message}`);

  res.status(statusCode).json({
    error: {
      message,
      statusCode,
    },
  });
};
