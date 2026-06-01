import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

export const getTransactions = asyncHandler(async (req: Request, res: Response) => {
  res.json({ message: 'GET transactions route' });
});
export const createTransactions = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json({ message: 'POST transactions route' });
});
export const updateTransactions = asyncHandler(async (req: Request, res: Response) => {
  res.json({ message: 'PUT transactions route' });
});
export const deleteTransactions = asyncHandler(async (req: Request, res: Response) => {
  res.json({ message: 'DELETE transactions route' });
});
