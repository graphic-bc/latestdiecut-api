// This is the final, correct code for Vercel's Redis Marketplace (Upstash).
import { Redis } from '@upstash/redis';

// This automatically uses the secret keys Vercel provides after connecting the Redis integration.
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(request, response) {
  // Allow requests from any origin
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Content-Type', 'application/json');
  
  const { searchParams } = new URL(request.url, `https://_`);
  const action = searchParams.get('action');
  const DB_KEY = 'counterValue';

  try {
    if (action === 'increment') {
      const newValue = await redis.incr(DB_KEY);
      return response.status(200).json({ value: newValue });
    } 
    else if (action === 'decrement') {
      const newValue = await redis.decr(DB_KEY);
      return response.status(200).json({ value: newValue });
    }
    else { // Default action is 'get'
      let value = await redis.get(DB_KEY);
      
      // If the counter doesn't exist yet, initialize it
      if (value === null) {
        value = 11350; // Your starting number
        await redis.set(DB_KEY, value);
      }
      
      return response.status(200).json({ value: value });
    }
  } catch (error) {
      console.error(error);
      return response.status(500).json({ error: 'Internal Server Error' });
  }
}
