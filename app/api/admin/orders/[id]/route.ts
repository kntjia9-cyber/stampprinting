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

        // Get current order to check status
        const currentOrder = await (prisma.order as any).findUnique({
            where: { id: parseInt(id) }
        });

        if (!currentOrder) {
            return NextResponse.json(
                { error: "Order not found" },
                { status: 404 }
            );
        }

        const updateData: any = {
            ...(status && { status }),
            ...(trackingNumber !== undefined && { trackingNumber })
        };

        // Auto-update status to SHIPPED if tracking number is added and status is PAID
        if (trackingNumber && (currentOrder.status === "PAID" || !status)) {
            updateData.status = "SHIPPED";
        }

        const order = await (prisma.order as any).update({
            where: { id: parseInt(id) },
            data: updateData
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
