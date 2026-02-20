"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { uploadFile } from "./upload-file";

export async function getStampTemplates() {
    return await prisma.stampTemplate.findMany({
        orderBy: { createdAt: "desc" },
    });
}

export async function getStampTemplate(id: string) {
    return await prisma.stampTemplate.findUnique({
        where: { id },
        include: { backgrounds: true }
    });
}

const parseSafeFloat = (val: any, defaultVal = 0) => {
    const parsed = parseFloat(val);
    return isNaN(parsed) ? defaultVal : parsed;
};

const parseOptionalFloat = (val: any) => {
    if (val === null || val === undefined || val === "") return null;
    const parsed = parseFloat(val);
    return isNaN(parsed) ? null : parsed;
};

export async function createStampTemplate(formData: FormData) {
    try {
        console.log("Creating stamp template...");
        const name = formData.get("name") as string;
        const width = parseSafeFloat(formData.get("width"));
        const height = parseSafeFloat(formData.get("height"));
        const backgroundUrl = formData.get("backgroundUrl") as string;
        const backgroundWidth = parseSafeFloat(formData.get("backgroundWidth"));
        const backgroundHeight = parseSafeFloat(formData.get("backgroundHeight"));
        const backgroundX = parseSafeFloat(formData.get("backgroundX"));
        const backgroundY = parseSafeFloat(formData.get("backgroundY"));
        const userImageWidth = parseSafeFloat(formData.get("userImageWidth"));
        const userImageHeight = parseSafeFloat(formData.get("userImageHeight"));
        const userImageX = parseSafeFloat(formData.get("userImageX"));
        const userImageY = parseSafeFloat(formData.get("userImageY"));
        const userImagePrintX = parseOptionalFloat(formData.get("userImagePrintX"));
        const userImagePrintY = parseOptionalFloat(formData.get("userImagePrintY"));
        const userImageColumns = parseInt(formData.get("userImageColumns") as string) || 1;
        const userImageRows = parseInt(formData.get("userImageRows") as string) || 1;
        const userImageColumnSpacing = parseSafeFloat(formData.get("userImageColumnSpacing"), 0);
        const userImageRowSpacing = parseSafeFloat(formData.get("userImageRowSpacing"), 0);
        const userImagePreviewColumnSpacing = parseSafeFloat(formData.get("userImagePreviewColumnSpacing"), 0);
        const userImagePreviewRowSpacing = parseSafeFloat(formData.get("userImagePreviewRowSpacing"), 0);

        const realStampSampleUrl = formData.get("realStampSampleUrl") as string;
        const realStampX = parseOptionalFloat(formData.get("realStampX"));
        const realStampY = parseOptionalFloat(formData.get("realStampY"));

        const whiteBorderWidth = parseOptionalFloat(formData.get("whiteBorderWidth"));
        const whiteBorderHeight = parseOptionalFloat(formData.get("whiteBorderHeight"));
        const whiteBorderX = parseOptionalFloat(formData.get("whiteBorderX"));
        const whiteBorderY = parseOptionalFloat(formData.get("whiteBorderY"));

        const isPublic = formData.get("isPublic") === "on";

        // Get alt backgrounds
        const backgrounds = [];
        for (let i = 0; i < 4; i++) {
            const entry = formData.get(`background-${i}`);
            if (entry && typeof entry !== "string" && (entry as any).size > 0) {
                const url = await uploadFile(entry as File);
                if (url) backgrounds.push({ url });
            }
        }

        // Handle File Uploads
        let finalRealStampUrl = realStampSampleUrl || null;
        const realStampFile = formData.get("realStampFile");
        if (realStampFile && typeof realStampFile !== "string" && (realStampFile as any).size > 0) {
            const url = await uploadFile(realStampFile as File);
            if (url) finalRealStampUrl = url;
        }

        // Removed whiteBorderFile handling as it is now a generated rectangle

        const data = {
            name,
            width,
            height,
            backgroundUrl,
            backgroundWidth,
            backgroundHeight,
            backgroundX,
            backgroundY,
            userImageWidth,
            userImageHeight,
            userImageX,
            userImageY,
            userImagePrintX,
            userImagePrintY,
            userImageColumns,
            userImageRows,
            userImageColumnSpacing,
            userImageRowSpacing,
            userImagePreviewColumnSpacing,
            userImagePreviewRowSpacing,
            realStampSampleUrl: finalRealStampUrl,
            realStampX,
            realStampY,
            whiteBorderWidth,
            whiteBorderHeight,
            whiteBorderX,
            whiteBorderY,
            backgrounds: {
                create: backgrounds
            }
        };

        console.log("Saving new template with data:", JSON.stringify(data, null, 2));
        await (prisma.stampTemplate as any).create({ data });

        console.log("Template created successfully.");
        revalidatePath("/admin/templates");
        revalidatePath("/editor");
    } catch (error) {
        console.error("Error creating template:", error);
        throw error;
    }
    redirect("/admin/templates");
}

export async function updateStampTemplate(id: string, formData: FormData) {
    try {
        console.log(`Updating template ${id}...`);
        const name = formData.get("name") as string;
        const width = parseSafeFloat(formData.get("width"));
        const height = parseSafeFloat(formData.get("height"));
        const backgroundUrl = formData.get("backgroundUrl") as string;
        const backgroundWidth = parseSafeFloat(formData.get("backgroundWidth"));
        const backgroundHeight = parseSafeFloat(formData.get("backgroundHeight"));
        const backgroundX = parseSafeFloat(formData.get("backgroundX"));
        const backgroundY = parseSafeFloat(formData.get("backgroundY"));
        const userImageWidth = parseSafeFloat(formData.get("userImageWidth"));
        const userImageHeight = parseSafeFloat(formData.get("userImageHeight"));
        const userImageX = parseSafeFloat(formData.get("userImageX"));
        const userImageY = parseSafeFloat(formData.get("userImageY"));
        const userImagePrintX = parseOptionalFloat(formData.get("userImagePrintX"));
        const userImagePrintY = parseOptionalFloat(formData.get("userImagePrintY"));
        const userImageColumns = parseInt(formData.get("userImageColumns") as string) || 1;
        const userImageRows = parseInt(formData.get("userImageRows") as string) || 1;
        const userImageColumnSpacing = parseSafeFloat(formData.get("userImageColumnSpacing"), 0);
        const userImageRowSpacing = parseSafeFloat(formData.get("userImageRowSpacing"), 0);
        const userImagePreviewColumnSpacing = parseSafeFloat(formData.get("userImagePreviewColumnSpacing"), 0);
        const userImagePreviewRowSpacing = parseSafeFloat(formData.get("userImagePreviewRowSpacing"), 0);

        const realStampSampleUrl = formData.get("realStampSampleUrl") as string;
        const realStampX = parseOptionalFloat(formData.get("realStampX"));
        const realStampY = parseOptionalFloat(formData.get("realStampY"));

        const whiteBorderWidth = parseOptionalFloat(formData.get("whiteBorderWidth"));
        const whiteBorderHeight = parseOptionalFloat(formData.get("whiteBorderHeight"));
        const whiteBorderX = parseOptionalFloat(formData.get("whiteBorderX"));
        const whiteBorderY = parseOptionalFloat(formData.get("whiteBorderY"));

        const backgrounds: { url: string }[] = [];
        for (let i = 0; i < 4; i++) {
            const entry = formData.get(`background-${i}`);
            const existingUrl = formData.get(`background-${i}-existing`) as string;
            if (entry && typeof entry !== "string" && (entry as any).size > 0) {
                const url = await uploadFile(entry as File);
                if (url) backgrounds.push({ url });
            } else if (existingUrl) {
                backgrounds.push({ url: existingUrl });
            }
        }

        let realStampSampleUrlToSave = realStampSampleUrl || null;
        const realStampFile = formData.get("realStampFile");
        if (realStampFile && typeof realStampFile !== "string" && (realStampFile as any).size > 0) {
            const url = await uploadFile(realStampFile as File);
            if (url) realStampSampleUrlToSave = url;
        }

        // Removed whiteBorderFile handling

        if (!id) {
            throw new Error("Template ID is missing");
        }

        const data = {
            name,
            width,
            height,
            backgroundUrl,
            backgroundWidth,
            backgroundHeight,
            backgroundX,
            backgroundY,
            userImageWidth,
            userImageHeight,
            userImageX,
            userImageY,
            userImagePrintX,
            userImagePrintY,
            userImageColumns,
            userImageRows,
            userImageColumnSpacing,
            userImageRowSpacing,
            userImagePreviewColumnSpacing,
            userImagePreviewRowSpacing,
            realStampSampleUrl: realStampSampleUrlToSave,
            realStampX,
            realStampY,
            whiteBorderWidth,
            whiteBorderHeight,
            whiteBorderX,
            whiteBorderY,
            backgrounds: {
                deleteMany: {}, // Clear existing backgrounds
                create: backgrounds.map(bg => ({ url: bg.url })) // Create new ones
            }
        };

        console.log("Updating template with data:", JSON.stringify(data, null, 2));

        // Use regular prisma call without 'as any' if possible, or cast specifically
        await (prisma.stampTemplate as any).update({
            where: { id: id },
            data: data,
        });

        console.log("Template updated successfully.");
        revalidatePath("/admin/templates");
        revalidatePath("/editor");
    } catch (error) {
        console.error("Error updating template:", error);
        throw error;
    }
    redirect("/admin/templates");
}

export async function deleteStampTemplate(id: string) {
    await prisma.stampTemplate.delete({
        where: { id },
    });
    revalidatePath("/admin/templates");
    revalidatePath("/editor");
}

export async function toggleTemplateVisibility(id: string, isPublic: boolean) {
    try {
        await prisma.stampTemplate.update({
            where: { id },
            data: { isPublic } as any,
        });
        revalidatePath("/admin/templates");
        revalidatePath("/editor");
    } catch (error) {
        console.error("Error toggling template visibility:", error);
        throw error;
    }
}
export async function cloneStampTemplate(id: string) {
    try {
        const template = await prisma.stampTemplate.findUnique({
            where: { id },
            include: { backgrounds: true }
        });

        if (!template) throw new Error("Template not found");

        // Clone the data except for IDs and timestamps
        const { id: _, createdAt: __, updatedAt: ___, backgrounds, ...data } = template;

        await (prisma.stampTemplate as any).create({
            data: {
                ...data,
                name: `${data.name} (Copy)`,
                backgrounds: {
                    create: backgrounds.map(bg => ({ url: bg.url }))
                }
            }
        });

        revalidatePath("/admin/templates");
        revalidatePath("/editor");
    } catch (error) {
        console.error("Error cloning template:", error);
        throw error;
    }
}
