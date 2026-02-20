
import prisma from "@/lib/prisma";
import EditorClient from "./EditorClient";

export const dynamic = "force-dynamic";

// This is a Server Component that fetches data
export default async function Page() {
    try {
        const templates = await prisma.stampTemplate.findMany({
            where: { isPublic: true },
            include: { backgrounds: true }
        } as any);

        return <EditorClient templates={templates as any} />;
    } catch (error) {
        console.warn("Could not fetch backgrounds (migration might be missing):", error);
        const templates = await prisma.stampTemplate.findMany({
            where: { isPublic: true }
        });
        // Fallback to empty backgrounds
        const fallbackTemplates = templates.map(t => ({ ...t, backgrounds: [] }));
        return <EditorClient templates={fallbackTemplates as any} />;
    }
}
