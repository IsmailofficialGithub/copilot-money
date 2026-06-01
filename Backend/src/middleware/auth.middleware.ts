import { Request, Response, NextFunction } from 'express';
import { supabase } from '../services/supabase.service';
import { AuthenticatedRequest } from '../types/supabase.types';

export const requireAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: Missing or invalid authorization header' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      res.status(401).json({ error: 'Unauthorized: Invalid token' });
      return;
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error during authentication' });
  }
};
