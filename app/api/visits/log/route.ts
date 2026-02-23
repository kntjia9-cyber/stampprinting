import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const { visitorId, path } = await req.json();

        if (!visitorId) {
            return NextResponse.json({ success: false, error: "Missing visitorId" }, { status: 400 });
        }

        // Log the visit
        await (prisma.visit as any).create({
            data: {
                visitorId,
                path: path || "/",
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error logging visit:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}
