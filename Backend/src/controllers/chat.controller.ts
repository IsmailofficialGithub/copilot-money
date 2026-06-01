import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

export const getChat = asyncHandler(async (req: Request, res: Response) => {
  if (req.path === '/conversations') {
    res.json({ data: [] });
  } else {
    res.json({ messages: [] });
  }
});
export const createChat = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json({ message: 'Hello from Revonix AI!' });
});
