import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadToCloudinary } from "@/lib/cloudinary";

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();

        const name = formData.get("name") as string;
        const address = formData.get("address") as string;
        const phone = formData.get("phone") as string;
        const email = formData.get("email") as string;
        const paymentProofFile = formData.get("paymentProof") as File;
        const orderIdsStr = formData.get("orderIds") as string;
        const total = parseFloat(formData.get("total") as string);

        if (!name || !address || !phone || !email || !paymentProofFile || !orderIdsStr) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const orderIds = JSON.parse(orderIdsStr).map((id: string | number) => parseInt(id.toString()));

        // Save payment proof image
        let paymentProofUrl = "";
        if (paymentProofFile) {
            const bytes = await paymentProofFile.arrayBuffer();
            const buffer = Buffer.from(bytes);

            // Upload to Cloudinary
            const uploadResult = await uploadToCloudinary(buffer, "payments");
            paymentProofUrl = uploadResult.url;
        }

        // Update all orders with customer info and payment proof
        for (const orderId of orderIds) {
            await (prisma.order as any).update({
                where: { id: orderId },
                data: {
                    status: "PAID",
                    customerName: name,
                    customerAddress: address,
                    customerPhone: phone,
                    customerEmail: email,
                    paymentProofUrl: paymentProofUrl
                }
            });
        }

        // In a real application, you would:
        // 1. Store customer info in a separate table or in the order
        // 2. Send confirmation email
        // 3. Notify admin about new payment

        // For now, we'll just log the information
        console.log("Checkout completed:", {
            name,
            address,
            phone,
            email,
            paymentProofUrl,
            orderIds,
            total
        });

        return NextResponse.json({
            success: true,
            message: "ชำระเงินเรียบร้อยแล้ว",
            paymentProofUrl
        });

    } catch (error) {
        console.error("Error processing checkout:", error);
        return NextResponse.json(
            { error: "Failed to process checkout" },
            { status: 500 }
        );
    }
}
