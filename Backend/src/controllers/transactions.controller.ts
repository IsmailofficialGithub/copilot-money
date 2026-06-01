import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

export const getTransactions = asyncHandler(async (req: Request, res: Response) => {
  res.json({ data: [], total: 0, page: 1, totalPages: 1 });
});
export const createTransactions = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json({ id: '1', ...req.body });
});
export const updateTransactions = asyncHandler(async (req: Request, res: Response) => {
  res.json({ id: req.params.id, ...req.body });
});
export const deleteTransactions = asyncHandler(async (req: Request, res: Response) => {
  res.json({ success: true });
});
