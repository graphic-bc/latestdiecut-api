// This is the final, correct code using the industry-standard 'ioredis' library,
// which correctly understands the REDIS_URL provided by Vercel.
import Redis from 'ioredis';

// This is the core fix. ioredis is built to parse the REDIS_URL format correctly.
// It will automatically connect using the key you set in the Vercel dashboard.
const redis = new Redis(process.env.REDIS_URL);

export default async function handler(request, response) {
  // Allow requests from any origin
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Content-Type', 'application/json');
  
  const { searchParams } = new URL(request.url, `https://_`);
  const action = searchParams.get('action');
  
  // Define our database keys
  const COUNTER_KEY = 'counterValue';
  const TIMESTAMP_KEY = 'counterTimestamp';

  try {
    const nowISO = new Date().toISOString(); // Get the current time in a standard format

    if (action === 'increment' || action === 'decrement') {
      // Use a Redis transaction to update both value and timestamp together
      const transaction = redis.multi();
      
      if (action === 'increment') {
        transaction.incr(COUNTER_KEY);
      } else {
        transaction.decr(COUNTER_KEY);
      }
      
      transaction.set(TIMESTAMP_KEY, nowISO);
      
      const results = await transaction.exec();
      
      // results is an array of results for each command, e.g., [[null, 11381], [null, 'OK']]
      const newValue = results[0][1];
      
      return response.status(200).json({ value: newValue, lastUpdated: nowISO });
    } 
    else { // Default action is 'get'
      // Use MGET to fetch both keys at once for efficiency
      let [value, lastUpdated] = await redis.mget(COUNTER_KEY, TIMESTAMP_KEY);
      
      // If the counter doesn't exist yet, initialize both keys
      if (value === null) {
        value = 11380; // Your starting number
        lastUpdated = new Date().toISOString();
        // Use a transaction to set both initial values
        await redis.multi()
          .set(COUNTER_KEY, value)
          .set(TIMESTAMP_KEY, lastUpdated)
          .exec();
      }
      
      return response.status(200).json({ value: Number(value), lastUpdated: lastUpdated });
    }
  } catch (error) {
      console.error(error);
      return response.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
