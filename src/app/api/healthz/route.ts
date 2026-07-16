import { NextResponse } from "next/server";

export const dynamic = "force-dynamic"; // Prevents Next.js from caching this route

export async function GET() {
    try {
        return NextResponse.json(
            {
                status: "healthy",
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
            },
            { status: 200 },
        );
    } catch (error) {
        return NextResponse.json(
            { status: "unhealthy", error: (error as Error).message },
            { status: 503 }, // 503 is the standard code for load balancers when an app is failing
        );
    }
}
