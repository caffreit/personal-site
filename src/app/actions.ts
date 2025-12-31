'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'node:fs';
import path from 'node:path';

export async function analyzeImageAction(imageUrl: string): Promise<string> {
  console.log('GEMINI_API_KEY check:', process.env.GEMINI_API_KEY ? 'Found' : 'Not found');
  console.log('Analyzing image URL:', imageUrl);
  if (!process.env.GEMINI_API_KEY) {
    return "Please config GEMINI_API_KEY in your .env file to enable AI analysis.";
  }

  try {
    // Convert public URL (e.g. /photos/album/img.jpg) to file system path
    // This assumes images are stored in /public/photos
    // Decode URL-encoded characters (e.g., %20 for spaces) before using as file path
    const decodedUrl = decodeURIComponent(imageUrl);
    const relativePath = decodedUrl.startsWith('/') ? decodedUrl.slice(1) : decodedUrl;
    const absolutePath = path.join(process.cwd(), 'public', relativePath);
    console.log('Looking for image at:', absolutePath);
    console.log('File exists:', fs.existsSync(absolutePath));

    if (!fs.existsSync(absolutePath)) {
      console.error(`File not found: ${absolutePath}`);
      return "Image file not found on server.";
    }

    // Determine mime type based on extension
    const ext = path.extname(absolutePath).toLowerCase();
    let mimeType = 'image/jpeg';
    if (ext === '.png') mimeType = 'image/png';
    if (ext === '.webp') mimeType = 'image/webp';
    if (ext === '.heic') mimeType = 'image/heic';
    if (ext === '.heif') mimeType = 'image/heif';

    const fileBuffer = fs.readFileSync(absolutePath);
    const base64Image = fileBuffer.toString('base64');
    console.log('Image loaded, size:', fileBuffer.length, 'bytes, mimeType:', mimeType);

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Using gemini-2.0-flash-exp as it's the one available for this key
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    
    const prompt = "Analyze this photograph. Describe the composition, lighting, mood, and any interesting details in a poetic and artistic way. Keep it concise (under 50 words).";

    console.log('Calling Gemini API...');
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Image,
          mimeType,
        },
      },
    ]);

    console.log('Got response from Gemini');
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error analyzing image:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error details:', errorMessage);
    // Return more helpful error message for debugging
    if (errorMessage.includes('API_KEY')) {
      return "API key error. Please check your GEMINI_API_KEY.";
    }
    return `Unable to analyze image: ${errorMessage}`;
  }
}

