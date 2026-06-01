import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

export const getChat = asyncHandler(async (req: Request, res: Response) => {
  res.json({ message: 'chat route' });
});
