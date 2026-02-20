import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Update order item quantity
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { quantity } = body;

        if (!quantity || quantity < 1) {
            return NextResponse.json(
                { error: "Invalid quantity" },
                { status: 400 }
            );
        }

        // Update the order item
        const orderItem = await prisma.orderItem.update({
            where: { id },
            data: { quantity },
            include: {
                order: true
            }
        });

        // Recalculate order total
        const orderItems = await prisma.orderItem.findMany({
            where: { orderId: orderItem.orderId }
        });

        const newTotal = orderItems.reduce(
            (sum, item) => sum + (item.price * item.quantity),
            0
        );

        // Update order total
        await prisma.order.update({
            where: { id: orderItem.orderId },
            data: { total: newTotal }
        });

        return NextResponse.json({
            success: true,
            message: "อัพเดทจำนวนเรียบร้อยแล้ว"
        });

    } catch (error) {
        console.error("Error updating order item:", error);
        return NextResponse.json(
            { error: "Failed to update order item" },
            { status: 500 }
        );
    }
}

// Delete order item
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Get order item to find the order
        const orderItem = await prisma.orderItem.findUnique({
            where: { id },
            include: { order: true }
        });

        if (!orderItem) {
            return NextResponse.json(
                { error: "Order item not found" },
                { status: 404 }
            );
        }

        const orderId = orderItem.orderId;

        // Delete the order item
        await prisma.orderItem.delete({
            where: { id }
        });

        // Check if order has any remaining items
        const remainingItems = await prisma.orderItem.findMany({
            where: { orderId }
        });

        if (remainingItems.length === 0) {
            // Delete the entire order if no items left
            await prisma.order.delete({
                where: { id: orderId }
            });
        } else {
            // Recalculate order total
            const newTotal = remainingItems.reduce(
                (sum, item) => sum + (item.price * item.quantity),
                0
            );

            await prisma.order.update({
                where: { id: orderId },
                data: { total: newTotal }
            });
        }

        return NextResponse.json({
            success: true,
            message: "ลบรายการเรียบร้อยแล้ว"
        });

    } catch (error) {
        console.error("Error deleting order item:", error);
        return NextResponse.json(
            { error: "Failed to delete order item" },
            { status: 500 }
        );
    }
}
