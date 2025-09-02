import { Redis } from '@upstash/redis';

// This now looks for the single REDIS_URL key that Vercel provides.
const redis = Redis.fromEnv();

export default async function handler(request, response) {
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
      
      if (value === null) {
        value = 11350;
        await redis.set(DB_KEY, value);
      }
      
      return response.status(200).json({ value: value });
    }
  } catch (error) {
      console.error(error);
      return response.status(500).json({ error: 'Internal Server Error' });
  }
}
