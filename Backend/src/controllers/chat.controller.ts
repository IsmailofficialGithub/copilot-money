import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import OpenAI from 'openai';
import { supabase } from '../services/supabase.service';
import { AuthenticatedRequest } from '../types/supabase.types';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const getChat = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (req.path === '/conversations') {
    res.json({ data: [] });
  } else {
    res.json({ messages: [] });
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
    const { data: documents, error } = await supabase.rpc('match_documents', {
      query_embedding,
      match_threshold: 0.5, // lower threshold to ensure matches
      match_count: 5,
      p_user_id: user_id,
    });

    if (error) {
      console.error('Vector search error:', error);
    }

    let contextText = '';
    if (documents && documents.length > 0) {
      contextText = documents.map((doc: any) => doc.content).join('\n---\n');
    }

    // 3. Generate response using OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are Revonix, an AI financial assistant. You help users manage their personal finances. 
Answer the user's questions based ONLY on the provided context (their uploaded receipts, documents, etc).
If the context does not contain the answer, politely say you don't have that information.
Keep responses concise and formatted cleanly with markdown.

Context:
${contextText || "No relevant documents found."}
`
        },
        {
          role: 'user',
          content: message
        }
      ],
    });

    const responseText = completion.choices[0].message.content;

    res.status(201).json({ 
      message: responseText,
      conversationId: req.body.conversationId || 'default',
      toolsUsed: documents && documents.length > 0 ? ['vector_search'] : []
    });
  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(500).json({ message: 'Error processing chat request' });
  }
});
