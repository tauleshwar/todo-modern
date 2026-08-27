import mongoose from "mongoose";

let connectionPromise: Promise<typeof mongoose> | undefined;

export async function connectDatabase() {
  if (mongoose.connection.readyState === 1) return mongoose;

  const mongoUrl = process.env.MONGO_URL;
  if (!mongoUrl) throw new Error("MONGO_URL is not configured");

  connectionPromise ??= mongoose.connect(mongoUrl, {
    dbName: process.env.MONGO_DB || "todo-modern",
    serverSelectionTimeoutMS: 10_000,
  });

  try {
    return await connectionPromise;
  } catch (error) {
    connectionPromise = undefined;
    throw error;
  }
}
