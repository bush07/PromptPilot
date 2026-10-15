import mongoose from 'mongoose';
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  // Defer the actionable error until a database-backed endpoint is requested.
}
let cached = globalThis.mongooseCache || { conn: null, promise: null };
globalThis.mongooseCache = cached;
export default async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!MONGODB_URI) throw new Error('MONGODB_URI is missing. Add it to .env.local.');
  if (!cached.promise) cached.promise = mongoose.connect(MONGODB_URI).then(m => m);
  cached.conn = await cached.promise;
  return cached.conn;
}
