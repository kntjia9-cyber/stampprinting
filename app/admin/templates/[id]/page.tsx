
export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { getStampTemplate } from "@/app/actions/stamp-templates";
import TemplateForm from "../_components/TemplateForm";

interface EditTemplatePageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function EditTemplatePage({ params }: EditTemplatePageProps) {
    const { id } = await params;
    const template = await getStampTemplate(id);

    if (!template) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Edit Template: {template.name}</h1>
            <TemplateForm template={template} />
        </div>
    );
}
