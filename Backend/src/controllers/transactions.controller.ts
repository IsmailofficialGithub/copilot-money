import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

export const getTransactions = asyncHandler(async (req: Request, res: Response) => {
  res.json({ message: 'transactions route' });
});
