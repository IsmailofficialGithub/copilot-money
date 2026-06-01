import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

export const getReceipts = asyncHandler(async (req: Request, res: Response) => {
  res.json({ message: 'receipts route' });
});
