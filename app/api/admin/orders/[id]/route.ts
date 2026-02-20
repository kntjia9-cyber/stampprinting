import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { status, trackingNumber } = body;

        const order = await (prisma.order as any).update({
            where: { id: parseInt(id) },
            data: {
                ...(status && { status }),
                ...(trackingNumber !== undefined && { trackingNumber })
            }
        });

        return NextResponse.json({
            success: true,
            order,
            message: "อัพเดทสถานะเรียบร้อยแล้ว"
        });

    } catch (error) {
        console.error("Error updating order:", error);
        return NextResponse.json(
            { error: "Failed to update order" },
            { status: 500 }
        );
    }
}
