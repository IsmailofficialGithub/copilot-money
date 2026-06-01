import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

export const getChat = asyncHandler(async (req: Request, res: Response) => {
  res.json({ message: 'GET chat route' });
});
export const createChat = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json({ message: 'POST chat route' });
});
