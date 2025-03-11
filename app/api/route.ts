import { NextResponse } from 'next/server';
import { getRedisClient } from '@/lib/redis';

export const GET = async () => {
  try {
    const redis = await getRedisClient();
    
    // Simple test: Store and retrieve a test key
    await redis.set("test_key", "Redis is working!");
    // const testValue = await redis.get("test_key");

    return NextResponse.json({ success: true, message: "Redis is working!" });
  } catch (error) {
    console.error("❌ Redis Connection Failed:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
};
