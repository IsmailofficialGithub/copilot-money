import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

export const getDashboard = asyncHandler(async (req: Request, res: Response) => {
  res.json({
    totalSpent: 0.0,
    previousMonthSpent: 0.0,
    percentChange: 0,
    topCategory: { name: 'None', amount: 0 },
    subscriptions: { count: 0, monthlyTotal: 0 },
    budgetStatus: { onTrack: 0, warning: 0, over: 0 },
    spendingByCategory: [],
    monthlyTrend: [],
    anomalies: [],
  });
});
