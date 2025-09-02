// This is a Vercel Serverless Function.
// It connects to Vercel's built-in Key-Value database.

import { kv } from '@vercel/kv';

export default async function handler(request, response) {
  // Allow requests from any origin so CodePen can talk to it
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Content-Type', 'application/json'); // Good practice to set content type
  
  const { searchParams } = new URL(request.url, `https://_`);
  const action = searchParams.get('action');
  const DB_KEY = 'counterValue';

  try {
    if (action === 'increment') {
      const newValue = await kv.incr(DB_KEY);
      return response.status(200).json({ value: newValue });
    } 
    else if (action === 'decrement') {
      const newValue = await kv.decr(DB_KEY);
      return response.status(200).json({ value: newValue });
    }
    else { // Default action is 'get'
      let value = await kv.get(DB_KEY);
      
      // If the counter doesn't exist yet, initialize it
      if (value === null) {
        value = 11350; // Your starting number
        await kv.set(DB_KEY, value);
      }
      
      return response.status(200).json({ value: value });
    }
  } catch (error) {
      console.error(error);
      return response.status(500).json({ error: 'Internal Server Error' });
  }
}
