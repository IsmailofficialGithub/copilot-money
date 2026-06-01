import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

export const getReceipts = asyncHandler(async (req: Request, res: Response) => {
  res.json({ message: 'GET receipts route' });
});
export const createReceipts = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json({ message: 'POST receipts route' });
});
export const updateReceipts = asyncHandler(async (req: Request, res: Response) => {
  res.json({ message: 'PUT receipts route' });
});
export const deleteReceipts = asyncHandler(async (req: Request, res: Response) => {
  res.json({ message: 'DELETE receipts route' });
});
