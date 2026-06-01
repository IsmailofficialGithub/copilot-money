import { Queue, Worker, Job } from 'bullmq';
import { processCsvIngestion } from './ingest.service';
import dotenv from 'dotenv';

dotenv.config();

const connection = {
  url: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
};

// Create Queue
export const csvQueue = new Queue('csv-ingestion', { connection });

// Create Worker
export const csvWorker = new Worker('csv-ingestion', async (job: Job) => {
  console.log(`Processing CSV job ${job.id}...`);
  // Data comes in as JSON, Buffer data may need conversion depending on serialization
  const buffer = Buffer.from(job.data.fileBuffer, 'base64');
  await processCsvIngestion(buffer);
  console.log(`CSV job ${job.id} completed.`);
}, { connection });

csvWorker.on('completed', (job) => {
  console.log(`Job ${job.id} successfully completed!`);
});

csvWorker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed: ${err.message}`);
});
