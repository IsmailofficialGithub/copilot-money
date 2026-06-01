import multer from 'multer';

// Use memory storage for fast processing before streaming to Supabase/OpenAI
const storage = multer.memoryStorage();

export const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB limit
  }
});
