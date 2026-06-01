import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

export const getDashboard = asyncHandler(async (req: Request, res: Response) => {
  res.json({ message: 'GET dashboard route' });
});
