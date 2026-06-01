import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

export const getReceipts = asyncHandler(async (req: Request, res: Response) => {
  res.json({ data: [] });
});
export const createReceipts = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json({ success: true, fileUrl: 'http://example.com/receipt.jpg' });
});
export const updateReceipts = asyncHandler(async (req: Request, res: Response) => {
  res.json({ id: req.params.id, ...req.body });
});
export const deleteReceipts = asyncHandler(async (req: Request, res: Response) => {
  res.json({ success: true });
});
