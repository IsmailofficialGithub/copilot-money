import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import OpenAI from 'openai';
import { supabase } from '../services/supabase.service';
import { AuthenticatedRequest } from '../types/supabase.types';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const getChat = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  
  if (req.path === '/conversations') {
    const { data, error } = await supabase
      .from('chat_conversations')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });
    if (error) throw error;
    res.json({ data: data || [] });
  } else {
    const conversationId = req.query.conversationId as string;
    if (!conversationId || conversationId === 'default') {
      res.json({ messages: [] });
      return;
    }
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    
    // Map to frontend ChatMessage format
    const formattedMessages = data.map((msg: any) => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      createdAt: msg.created_at,
      toolsUsed: msg.tools_used
    }));
    
    res.json({ messages: formattedMessages });
  }
});

export const createChat = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { message } = req.body;
  const user_id = req.user?.id;

  if (!message) {
    res.status(400).json({ message: 'Message is required' });
    return;
  }

  try {
    // 1. Generate embedding for the user's message
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: message,
    });
    const query_embedding = embeddingResponse.data[0].embedding;

    // 2. Query Supabase pgvector using the match_documents RPC
    const { data: documents, error: vectorError } = await supabase.rpc('match_documents', {
      query_embedding,
      match_threshold: 0.5,
      match_count: 5,
      p_user_id: user_id,
    });

    // Fetch the user's actual financial data
    const { data: recentTxns } = await supabase
      .from('transactions')
      .select('date, amount, merchant_name, category, description, source')
      .eq('user_id', user_id)
      .order('date', { ascending: false })
      .limit(50);
    const { data: budgets } = await supabase.from('budgets').select('category, amount, period').eq('user_id', user_id);

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const monthlySpending = (recentTxns || []).reduce<Record<string, number>>((acc, txn) => {
      const txnDate = new Date(txn.date);
      const amount = Number(txn.amount);
      if (txnDate.getMonth() === currentMonth && txnDate.getFullYear() === currentYear && amount < 0) {
        acc[txn.category] = (acc[txn.category] || 0) + Math.abs(amount);
      }
      return acc;
    }, {});

    const budgetStatus = (budgets || []).map((budget) => {
      const spent = monthlySpending[budget.category] || 0;
      const percentUsed = Number(budget.amount) > 0 ? (spent / Number(budget.amount)) * 100 : 0;
      return {
        category: budget.category,
        budget: Number(budget.amount),
        period: budget.period,
        spent,
        remaining: Number(budget.amount) - spent,
        percentUsed: Math.round(percentUsed),
        overBudget: spent > Number(budget.amount),
      };
    });

    let contextText = '';
    if (documents && documents.length > 0) {
      contextText += "Uploaded Receipts & Documents:\n" + documents.map((doc: any) => doc.content).join('\n---\n') + "\n\n";
    }

    if (recentTxns && recentTxns.length > 0) {
      contextText += "Recent Transactions:\n" + JSON.stringify(recentTxns) + "\n\n";
    }

    if (budgets && budgets.length > 0) {
      contextText += "Current Budgets:\n" + JSON.stringify(budgets) + "\n\n";
      contextText += "Current Month Spending By Category (expenses are negative transaction amounts):\n" + JSON.stringify(monthlySpending) + "\n\n";
      contextText += "Current Budget Status:\n" + JSON.stringify(budgetStatus) + "\n\n";
    }

    // 3. Persistent Chat Logistics
    let activeConversationId = req.body.conversationId;
    
    // Create new conversation if none provided
    if (!activeConversationId || activeConversationId === 'default') {
      const { data: convData, error: convError } = await supabase
        .from('chat_conversations')
        .insert([{ user_id: user_id, title: message.substring(0, 40) + (message.length > 40 ? '...' : '') }])
        .select()
        .single();
      
      if (convError) throw convError;
      activeConversationId = convData.id;
    }

    // Insert user message
    await supabase
      .from('chat_messages')
      .insert([{ conversation_id: activeConversationId, role: 'user', content: message }]);

    // 4. Generate response using OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are Revonix, an expert AI financial assistant. You help users manage their personal finances. 
Answer the user's questions based ONLY on the provided context, which includes their uploaded receipts, recent transactions, and budgets.
If the user asks about their spending, summarize the transactions provided. Treat negative transaction amounts as spending/expenses and positive amounts as income/refunds.
For budget questions, use Current Budget Status first and mention the category, spent amount, budget amount, and remaining or over amount.
If the context does not contain the answer, politely say you don't have that information.
Keep responses concise, friendly, and formatted cleanly with markdown.

Context:
${contextText || "No relevant financial data found yet."}
`
        },
        {
          role: 'user',
          content: message
        }
      ],
    });

    const responseText = completion.choices[0].message.content;
    const toolsUsed = documents && documents.length > 0 ? ['vector_search'] : [];

    // Insert assistant message
    await supabase
      .from('chat_messages')
      .insert([{ conversation_id: activeConversationId, role: 'assistant', content: responseText, tools_used: toolsUsed }]);

    // Update conversation timestamp
    await supabase.from('chat_conversations').update({ updated_at: new Date().toISOString() }).eq('id', activeConversationId);

    res.status(201).json({ 
      message: responseText,
      conversationId: activeConversationId,
      toolsUsed: toolsUsed
    });
  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(500).json({ message: 'Error processing chat request' });
  }
});

export const deleteChat = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const conversationId = req.params.conversationId;

  const { error } = await supabase
    .from('chat_conversations')
    .delete()
    .eq('id', conversationId)
    .eq('user_id', userId);

  if (error) throw error;
  res.json({ success: true });
});
