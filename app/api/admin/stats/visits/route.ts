import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: Request) {
    try {
        const session = await auth();
        if (!session || (session.user as any)?.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const dateStr = searchParams.get("date"); // YYYY-MM-DD

        const now = new Date();
        const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

        // 1. Online Now (Unique visitorId in last 5 minutes)
        const onlineNowCount = await (prisma.visit as any).groupBy({
            by: ['visitorId'],
            where: {
                timestamp: {
                    gte: fiveMinutesAgo
                }
            }
        });

        // 2. Daily Visitors (Unique visitorId for specific date or today)
        let targetDateStart = new Date();
        if (dateStr) {
            targetDateStart = new Date(dateStr);
        }
        targetDateStart.setHours(0, 0, 0, 0);

        const targetDateEnd = new Date(targetDateStart);
        targetDateEnd.setHours(23, 59, 59, 999);

        const dailyVisitorsCount = await (prisma.visit as any).groupBy({
            by: ['visitorId'],
            where: {
                timestamp: {
                    gte: targetDateStart,
                    lte: targetDateEnd
                }
            }
        });

        return NextResponse.json({
            success: true,
            stats: {
                onlineNow: onlineNowCount.length,
                dailyTotal: dailyVisitorsCount.length,
                date: targetDateStart.toISOString().split('T')[0]
            }
        });
    } catch (error) {
        console.error("Error fetching visitor stats:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}
