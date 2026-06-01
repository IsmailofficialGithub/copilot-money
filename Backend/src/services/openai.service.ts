import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openaiApiKey = process.env.OPENAI_API_KEY;

if (!openaiApiKey) {
  console.warn('Warning: OPENAI_API_KEY is missing. OpenAI features will not work.');
}

// Instantiate OpenAI client
export const openai = new OpenAI({
  apiKey: openaiApiKey || 'placeholder-key', // Prevent crash on boot if missing
});
