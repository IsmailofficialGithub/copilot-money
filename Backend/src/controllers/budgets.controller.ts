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

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

  const { data: transactions, error: txError } = await supabase
    .from('transactions')
    .select('amount, category, date')
    .eq('user_id', userId)
    .gte('date', monthStart)
    .lte('date', monthEnd);

  if (txError) throw txError;

  const spendingByCategory = (transactions || []).reduce<Record<string, number>>((acc, txn) => {
    const amount = Number(txn.amount);
    if (amount < 0) {
      acc[txn.category] = (acc[txn.category] || 0) + Math.abs(amount);
    }
    return acc;
  }, {});

  const budgets = (data || []).map((budget) => {
    const spent = spendingByCategory[budget.category] || 0;
    const percentUsed = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
    return {
      id: budget.id,
      category: budget.category,
      amount: Number(budget.amount),
      spent,
      period: budget.period,
      percentUsed,
      active: true,
      createdAt: budget.created_at,
    };
  });

  res.json({ data: budgets });
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
