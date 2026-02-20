import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
    try {
        // Fetch all orders that are not PENDING (or all orders, for admin visibility)
        const orders = await prisma.order.findMany({
            where: {
                status: {
                    not: "PENDING"
                }
            },
            include: {
                items: {
                    include: {
                        template: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json({
            success: true,
            orders
        });

    } catch (error) {
        console.error("Error fetching admin orders:", error);
        return NextResponse.json(
            { error: "Failed to fetch admin orders" },
            { status: 500 }
        );
    }
}
