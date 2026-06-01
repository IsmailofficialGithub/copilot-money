import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import OpenAI from 'openai';
import { supabase } from '../services/supabase.service';
import { AuthenticatedRequest } from '../types/supabase.types';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const getReceipts = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  res.json({ data: [] });
});

export const createReceipts = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const file = req.file;
  const user_id = req.user?.id;

  if (!file) {
    res.status(400).json({ message: 'No file uploaded' });
    return;
  }

  try {
    // 1. Convert file buffer to base64
    const base64Image = file.buffer.toString('base64');
    const mimeType = file.mimetype;

    // 2. Call OpenAI Vision to parse the receipt
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a receipt transcription AI. Extract all text from this receipt accurately, including merchant name, date, items, prices, and total.'
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Extract the text from this receipt.' },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`
              }
            }
          ]
        }
      ],
    });

    const parsedText = completion.choices[0].message.content || 'Unable to parse receipt.';

    // 3. Generate embedding for the parsed text
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: parsedText,
    });
    const embedding = embeddingResponse.data[0].embedding;

    // 4. Save to document_embeddings in Supabase
    const { data: insertedDoc, error } = await supabase
      .from('document_embeddings')
      .insert({
        user_id,
        content: parsedText,
        metadata: {
          filename: file.originalname,
          mimetype: mimeType,
          type: 'receipt'
        },
        embedding: JSON.stringify(embedding)
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting embedding:', error);
      res.status(500).json({ message: 'Failed to save receipt embedding' });
      return;
    }

    res.status(201).json({ 
      success: true, 
      id: insertedDoc?.id || Date.now().toString(),
      extractedData: {
        text: parsedText
      },
      status: 'processed'
    });
  } catch (error: any) {
    console.error('Receipt processing error:', error);
    res.status(500).json({ message: 'Error processing receipt' });
  }
});

export const updateReceipts = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  res.json({ id: req.params.id, ...req.body });
});

export const deleteReceipts = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  res.json({ success: true });
});
