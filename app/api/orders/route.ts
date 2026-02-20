import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadToCloudinary } from "@/lib/cloudinary";

export async function GET(request: NextRequest) {
    try {
        const guestUserId = "guest-user";

        // Fetch only pending orders for guest user
        const orders = await prisma.order.findMany({
            where: {
                userId: guestUserId,
                status: "PENDING"
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
        console.error("Error fetching orders:", error);
        return NextResponse.json(
            { error: "Failed to fetch orders" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();

        const templateId = formData.get("templateId") as string;
        const backgroundUrl = formData.get("backgroundUrl") as string;
        const quantity = parseInt(formData.get("quantity") as string) || 1;
        const price = parseFloat(formData.get("price") as string) || 0;
        const imageFile = formData.get("image") as File | null;
        const adjustments = formData.get("adjustments") as string;

        if (!templateId) {
            return NextResponse.json(
                { error: "Template ID is required" },
                { status: 400 }
            );
        }

        // Get template to verify it exists
        const template = await prisma.stampTemplate.findUnique({
            where: { id: templateId }
        });

        if (!template) {
            return NextResponse.json(
                { error: "Template not found" },
                { status: 404 }
            );
        }

        let customImageUrl = "";

        // Save uploaded image if provided
        if (imageFile) {
            const bytes = await imageFile.arrayBuffer();
            const buffer = Buffer.from(bytes);

            // Upload to Cloudinary
            const uploadResult = await uploadToCloudinary(buffer, "orders");
            customImageUrl = uploadResult.url;
        }

        // For now, create a guest order
        const guestUserId = "guest-user";

        // Use upsert to ensure guest user exists
        await prisma.user.upsert({
            where: { id: guestUserId },
            update: {},
            create: {
                id: guestUserId,
                name: "Guest User",
                role: "USER"
            }
        });

        // Check for existing PENDING order
        console.log("Checking for existing order for user:", guestUserId);
        const existingOrder = await prisma.order.findFirst({
            where: {
                userId: guestUserId,
                status: "PENDING"
            }
        });

        let order;
        if (existingOrder) {
            console.log("Updating existing order:", existingOrder.id);
            // Append item to existing order
            order = await (prisma.order as any).update({
                where: { id: existingOrder.id },
                data: {
                    total: existingOrder.total + (price * quantity),
                    items: {
                        create: {
                            templateId,
                            quantity,
                            price,
                            customImageUrl,
                            previewUrl: backgroundUrl || template.backgroundUrl,
                            adjustments: adjustments || null
                        }
                    }
                },
                include: {
                    items: true
                }
            });
        } else {
            console.log("Creating new order for user:", guestUserId);
            // Create a new order
            order = await (prisma.order as any).create({
                data: {
                    userId: guestUserId,
                    total: price * quantity,
                    status: "PENDING",
                    items: {
                        create: {
                            templateId,
                            quantity,
                            price,
                            customImageUrl,
                            previewUrl: backgroundUrl || template.backgroundUrl,
                            adjustments: adjustments || null
                        }
                    }
                },
                include: {
                    items: true
                }
            });
        }

        console.log("Order processed successfully:", order.id);
        return NextResponse.json({
            success: true,
            order,
            message: "เพิ่มลงตะกร้าเรียบร้อยแล้ว!"
        });

    } catch (error) {
        console.error("Detailed error creating order:", error);
        return NextResponse.json(
            { error: "Failed to create order", details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
