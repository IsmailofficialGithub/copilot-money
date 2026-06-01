import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import { supabase } from '../services/supabase.service';
import { AuthenticatedRequest } from '../types/supabase.types';
import Papa from 'papaparse';

export const getTransactions = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { page = '1', limit = '10', category, search } = req.query;

  const pageNum = parseInt(page as string, 10) || 1;
  const limitNum = parseInt(limit as string, 10) || 10;
  const from = (pageNum - 1) * limitNum;
  const to = from + limitNum - 1;

  let query = supabase
    .from('transactions')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (category) {
    query = query.eq('category', category);
  }

  if (search) {
    query = query.or(`merchant_name.ilike.%${search}%,description.ilike.%${search}%`);
  }

  const { data, error, count } = await query.range(from, to);

  if (error) throw error;
  res.json({ data: data || [], total: count || 0, page: pageNum, totalPages: Math.ceil((count || 0) / limitNum) });
});

export const createTransactions = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { date, amount, merchant_name, category, description, source } = req.body;

  const { data, error } = await supabase
    .from('transactions')
    .insert([{ user_id: userId, date, amount, merchant_name, category, description, source: source || 'manual' }])
    .select()
    .single();

  if (error) throw error;
  res.status(201).json(data);
});

export const uploadTransactions = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const file = req.file;

  if (!file) {
    res.status(400).json({ error: 'No file uploaded' });
    return;
  }

  const csvContent = file.buffer.toString('utf-8');
  Papa.parse(csvContent, {
    header: true,
    skipEmptyLines: true,
    complete: async (results) => {
      try {
        const transactionsToInsert = results.data.map((row: any) => ({
          user_id: userId,
          date: row.date || new Date().toISOString().split('T')[0],
          amount: parseFloat(row.amount || '0'),
          merchant_name: row.merchant_name || 'Unknown',
          category: row.category || 'Other',
          description: row.description || '',
          source: 'csv'
        }));

        const { data, error } = await supabase
          .from('transactions')
          .insert(transactionsToInsert)
          .select();

        if (error) throw error;

        // Also update budgets spent amount based on new transactions
        // Note: For a real app, you might want to sum this correctly instead of a basic loop.
        
        res.status(201).json({ message: 'Upload successful', data });
      } catch (err: any) {
        res.status(500).json({ error: err.message || 'Database error processing upload' });
      }
    },
    error: (err: any) => {
      res.status(400).json({ error: 'Failed to parse CSV file: ' + err.message });
    }
  });
});

export const updateTransactions = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const transactionId = req.params.id;

  const { data, error } = await supabase
    .from('transactions')
    .update(req.body)
    .eq('id', transactionId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  res.json(data);
});

export const deleteTransactions = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const transactionId = req.params.id;

  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', transactionId)
    .eq('user_id', userId);

  if (error) throw error;
  res.json({ success: true });
});
