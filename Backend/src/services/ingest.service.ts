import Papa from 'papaparse';

export const parseCSV = (csvString: string): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(csvString, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => resolve(results.data),
      error: (error: any) => reject(error),
    });
  });
};

export const processCsvIngestion = async (fileBuffer: Buffer) => {
  const csvString = fileBuffer.toString('utf-8');
  const data = await parseCSV(csvString);
  
  // Here we will add logic to validate via Zod and push to Supabase
  console.log(`Processed CSV with ${data.length} records.`);
  return data;
};
