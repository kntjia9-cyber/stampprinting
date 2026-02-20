"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function registerUser(formData: FormData) {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
        return { error: "กรุณากรอกอีเมลและรหัสผ่าน" };
    }

    try {
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return { error: "อีเมลนี้ถูกใช้งานแล้ว" };
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: "USER"
            }
        });

        return { success: true };
    } catch (error) {
        console.error("Registration error:", error);
        return { error: "เกิดข้อผิดพลาดในการสมัครสมาชิก" };
    }
}

export async function getUserOrders(userId: string) {
    return await prisma.order.findMany({
        where: { userId },
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
}

export async function getUser(userId: string) {
    return await (prisma.user as any).findUnique({
        where: { id: userId },
        select: {
            name: true,
            email: true,
            phone: true,
            address: true
        }
    });
}

export async function updateUserInfo(userId: string, data: { name?: string, phone?: string, address?: string }) {
    try {
        await (prisma.user as any).update({
            where: { id: userId },
            data
        });
        return { success: true };
    } catch (error) {
        console.error("Update user error:", error);
        return { error: "Failed to update user info" };
    }
}

export async function updateAdminPassword(adminId: string, newPassword: string) {
    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: adminId },
            data: { password: hashedPassword }
        });
        return { success: true };
    } catch (error) {
        console.error("Update admin password error:", error);
        return { error: "Failed to update password" };
    }
}

export async function updateAdminEmail(adminId: string, newEmail: string) {
    try {
        const existingUser = await prisma.user.findUnique({
            where: { email: newEmail }
        });

        if (existingUser && existingUser.id !== adminId) {
            return { error: "อีเมลนี้ถูกใช้งานแล้ว" };
        }

        await prisma.user.update({
            where: { id: adminId },
            data: { email: newEmail }
        });

        revalidatePath("/admin/settings");
        return { success: true };
    } catch (error) {
        console.error("Update admin email error:", error);
        return { error: "Failed to update email" };
    }
}
