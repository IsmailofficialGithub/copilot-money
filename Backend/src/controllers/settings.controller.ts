import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import { supabase } from '../services/supabase.service';
import { AuthenticatedRequest } from '../types/supabase.types';

// GET /settings
export const getSettings = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  // Fetch the profile
  let { data: profile, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;

  // If no profile found, return default settings
  if (!profile) {
    res.json({
      displayName: req.user?.email?.split('@')[0] || 'User',
      email: req.user?.email || '',
      currency: 'USD',
      payDate: 1,
      notifications: {
        budgetAlerts: true,
        anomalyAlerts: true,
        weeklySummary: false,
      },
      theme: 'light',
    });
    return;
  }

  res.json({
    displayName: profile.display_name || '',
    email: profile.email || '',
    currency: profile.currency || 'USD',
    payDate: profile.pay_date || 1,
    notifications: {
      budgetAlerts: profile.budget_alerts ?? true,
      anomalyAlerts: profile.anomaly_alerts ?? true,
      weeklySummary: profile.weekly_summary ?? false,
    },
    theme: profile.theme || 'light',
  });
});

// PUT /settings
export const updateSettings = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const { displayName, currency, payDate, notifications, theme } = req.body;

  const updates: any = {};
  if (displayName !== undefined) updates.display_name = displayName;
  if (currency !== undefined) updates.currency = currency;
  if (payDate !== undefined) updates.pay_date = payDate;
  if (theme !== undefined) updates.theme = theme;
  
  if (notifications !== undefined) {
    if (notifications.budgetAlerts !== undefined) updates.budget_alerts = notifications.budgetAlerts;
    if (notifications.anomalyAlerts !== undefined) updates.anomaly_alerts = notifications.anomalyAlerts;
    if (notifications.weeklySummary !== undefined) updates.weekly_summary = notifications.weeklySummary;
  }

  const { error } = await supabase
    .from('user_profiles')
    .update(updates)
    .eq('id', userId);

  if (error) throw error;

  res.json({ success: true, message: 'Settings updated successfully' });
});

// GET /settings/export
export const exportSettings = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (error) throw error;

  let csvContent = 'Date,Amount,Merchant,Category,Description,Recurring,Anomaly,Source\n';
  (transactions || []).forEach((t) => {
    const row = [
      t.date,
      t.amount,
      `"${(t.merchant_name || '').replace(/"/g, '""')}"`,
      `"${(t.category || '').replace(/"/g, '""')}"`,
      `"${(t.description || '').replace(/"/g, '""')}"`,
      t.is_recurring ? 'Yes' : 'No',
      t.is_anomaly ? 'Yes' : 'No',
      t.source
    ].join(',');
    csvContent += row + '\n';
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="transactions.csv"');
  res.status(200).send(csvContent);
});

// DELETE /settings/transactions
export const deleteSettingsTransactions = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('user_id', userId);

  if (error) throw error;

  res.json({ success: true, message: 'All transactions deleted successfully' });
});

// DELETE /settings/account
export const deleteSettingsAccount = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  // Delete auth user (service role client admin privileges)
  const { error } = await supabase.auth.admin.deleteUser(userId);

  if (error) throw error;

  res.json({ success: true, message: 'Account and associated data deleted successfully' });
});
