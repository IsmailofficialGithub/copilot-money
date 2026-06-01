import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

export const getBudgets = asyncHandler(async (req: Request, res: Response) => {
  res.json({ message: 'budgets route' });
});
