import { Redis } from '@upstash/redis';

// THIS IS THE FIX:
// Instead of using the 'magic' fromEnv(), we are now explicitly
// telling the Redis client where to find the URL. We are reading
// the 'REDIS_URL' environment variable that YOU set in the Vercel dashboard.
const redis = new Redis({
  url: process.env.REDIS_URL,
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
      console.error(error); // This will now log more detailed errors if they happen
      return response.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
