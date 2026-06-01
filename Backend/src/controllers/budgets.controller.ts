import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import { supabase } from '../services/supabase.service';
import { AuthenticatedRequest } from '../types/supabase.types';

export const getBudgets = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  res.json({ data: data || [] });
});

export const createBudgets = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { category, amount, period } = req.body;

  const { data, error } = await supabase
    .from('budgets')
    .insert([{ user_id: userId, category, amount, period }])
    .select()
    .single();

  if (error) throw error;
  res.status(201).json(data);
});

export const updateBudgets = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const budgetId = req.params.id;
  const { category, amount, period } = req.body;

  const { data, error } = await supabase
    .from('budgets')
    .update({ category, amount, period })
    .eq('id', budgetId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  res.json(data);
});

export const deleteBudgets = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const budgetId = req.params.id;

  const { error } = await supabase
    .from('budgets')
    .delete()
    .eq('id', budgetId)
    .eq('user_id', userId);

  if (error) throw error;
  res.json({ success: true });
});
