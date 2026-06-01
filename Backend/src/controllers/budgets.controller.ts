import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

export const getBudgets = asyncHandler(async (req: Request, res: Response) => {
  res.json({ data: [] });
});
export const createBudgets = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json({ id: '1', ...req.body });
});
export const updateBudgets = asyncHandler(async (req: Request, res: Response) => {
  res.json({ id: req.params.id, ...req.body });
});
export const deleteBudgets = asyncHandler(async (req: Request, res: Response) => {
  res.json({ success: true });
});
