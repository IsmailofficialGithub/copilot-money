import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

export const getBudgets = asyncHandler(async (req: Request, res: Response) => {
  res.json({ message: 'GET budgets route' });
});
export const createBudgets = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json({ message: 'POST budgets route' });
});
export const updateBudgets = asyncHandler(async (req: Request, res: Response) => {
  res.json({ message: 'PUT budgets route' });
});
export const deleteBudgets = asyncHandler(async (req: Request, res: Response) => {
  res.json({ message: 'DELETE budgets route' });
});
