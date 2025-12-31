'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';

export async function analyzeImageAction(imageUrl: string): Promise<string> {
  console.log('GEMINI_API_KEY check:', process.env.GEMINI_API_KEY ? 'Found' : 'Not found');
  console.log('Analyzing image URL:', imageUrl);
  if (!process.env.GEMINI_API_KEY) {
    return "Please config GEMINI_API_KEY in your .env file to enable AI analysis.";
  }

  try {
    // Fetch image from public URL instead of reading from filesystem
    // This prevents Vercel from bundling images into serverless functions
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL 
      || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null)
      || 'http://localhost:3000';
    
    const fullImageUrl = imageUrl.startsWith('http') 
      ? imageUrl 
      : `${baseUrl}${imageUrl.startsWith('/') ? imageUrl : '/' + imageUrl}`;
    
    console.log('Fetching image from:', fullImageUrl);
    
    const imageResponse = await fetch(fullImageUrl);
    if (!imageResponse.ok) {
      console.error(`Failed to fetch image: ${imageResponse.status} ${imageResponse.statusText}`);
      return "Image file not found on server.";
    }

    const arrayBuffer = await imageResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString('base64');
    
    // Determine mime type from response headers or URL
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
    let mimeType = contentType;
    if (!mimeType.startsWith('image/')) {
      // Fallback: determine from URL extension
      const ext = imageUrl.toLowerCase().split('.').pop();
      if (ext === 'png') mimeType = 'image/png';
      else if (ext === 'webp') mimeType = 'image/webp';
      else if (ext === 'heic') mimeType = 'image/heic';
      else if (ext === 'heif') mimeType = 'image/heif';
      else mimeType = 'image/jpeg';
    }
    
    console.log('Image loaded, size:', buffer.length, 'bytes, mimeType:', mimeType);

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

