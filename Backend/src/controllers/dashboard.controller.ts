import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import { supabase } from '../services/supabase.service';
import { AuthenticatedRequest } from '../types/supabase.types';

export const getDashboard = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  // Fetch all user transactions
  const { data: transactions, error: txError } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId);

  // Fetch all user budgets
  const { data: budgets, error: bgError } = await supabase
    .from('budgets')
    .select('*')
    .eq('user_id', userId);

  if (txError) throw txError;
  if (bgError) throw bgError;

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  let totalSpent = 0;
  let previousMonthSpent = 0;
  let subscriptionsTotal = 0;
  let subscriptionsCount = 0;

  const categorySpendingMap: Record<string, number> = {};
  const anomalies: any[] = [];
  const monthlyTrendMap: Record<string, number> = {};

  (transactions || []).forEach((txn) => {
    // Only count expenses (negative amounts) for spending
    const amount = txn.amount < 0 ? Math.abs(txn.amount) : 0;
    const txnDate = new Date(txn.date);
    const tMonth = txnDate.getMonth();
    const tYear = txnDate.getFullYear();

    if (tMonth === currentMonth && tYear === currentYear) {
      totalSpent += amount;
      categorySpendingMap[txn.category] = (categorySpendingMap[txn.category] || 0) + amount;
      
      if (txn.is_recurring) {
        subscriptionsTotal += amount;
        subscriptionsCount++;
      }
    }

    if (tMonth === previousMonth && tYear === previousYear) {
      previousMonthSpent += amount;
    }

    if (txn.is_anomaly) {
      anomalies.push({
        id: txn.id,
        merchant: txn.merchant_name,
        amount: txn.amount,
        date: txn.date,
        category: txn.category,
      });
    }

    // Monthly trend
    const monthKey = `${txnDate.toLocaleString('default', { month: 'short' })} ${tYear}`;
    monthlyTrendMap[monthKey] = (monthlyTrendMap[monthKey] || 0) + amount;
  });

  const percentChange = previousMonthSpent === 0 
    ? (totalSpent > 0 ? 100 : 0) 
    : Math.round(((totalSpent - previousMonthSpent) / previousMonthSpent) * 100);

  let topCategoryName = 'None';
  let topCategoryAmount = 0;
  const spendingByCategory = Object.entries(categorySpendingMap).map(([category, amount]) => {
    if (amount > topCategoryAmount) {
      topCategoryAmount = amount;
      topCategoryName = category;
    }
    return { category, amount };
  }).sort((a, b) => b.amount - a.amount);

  const monthlyTrend = Object.entries(monthlyTrendMap).map(([month, amount]) => ({
    month, amount
  })).slice(-6); // Just last 6 months roughly, for simplicity

  let onTrack = 0;
  let warning = 0;
  let over = 0;

  (budgets || []).forEach((budget) => {
    const spent = categorySpendingMap[budget.category] || 0;
    const percentUsed = (spent / budget.amount) * 100;
    if (percentUsed > 100) over++;
    else if (percentUsed > 80) warning++;
    else onTrack++;
  });

  res.json({
    totalSpent,
    previousMonthSpent,
    percentChange,
    topCategory: { name: topCategoryName, amount: topCategoryAmount },
    subscriptions: { count: subscriptionsCount, monthlyTotal: subscriptionsTotal },
    budgetStatus: { onTrack, warning, over },
    spendingByCategory,
    monthlyTrend,
    anomalies: anomalies.slice(0, 5),
  });
});
