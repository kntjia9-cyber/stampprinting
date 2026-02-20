
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getSettings() {
    try {
        const settings = await prisma.globalSettings.upsert({
            where: { id: "settings" },
            update: {},
            create: {
                id: "settings",
                bankName: "ธนาคารกสิกรไทย",
                accountName: "Stamp Printing Co., Ltd.",
                accountNumber: "123-4-56789-0",
                promptPayId: "0811234567"
            }
        });

        return { success: true, settings };
    } catch (error) {
        console.error("Error fetching settings:", error);
        return { success: false, error: "Failed to fetch settings" };
    }
}

export async function updateSettings(data: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    promptPayId: string;
}) {
    try {
        await prisma.globalSettings.update({
            where: { id: "settings" },
            data: {
                bankName: data.bankName,
                accountName: data.accountName,
                accountNumber: data.accountNumber,
                promptPayId: data.promptPayId,
            }
        });

        revalidatePath("/admin/settings");
        revalidatePath("/checkout");
        return { success: true };
    } catch (error) {
        console.error("Error updating settings:", error);
        return {
            success: false,
            error: "Failed to update settings",
            details: error instanceof Error ? error.message : String(error)
        };
    }
}
