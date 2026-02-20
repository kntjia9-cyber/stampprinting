
export const dynamic = "force-dynamic";

import Link from "next/link";
import { Plus, Edit, Trash2 } from "lucide-react";
import prisma from "@/lib/prisma";
import { getStampTemplates, deleteStampTemplate } from "@/app/actions/stamp-templates";
import VisibilityToggle from "./_components/VisibilityToggle";

export default async function TemplatesPage() {
    const templates = await getStampTemplates() as any[];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">📦 Stamp Templates</h1>
                <Link
                    href="/admin/templates/new"
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                    <Plus size={20} />
                    Add New Template
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map((template) => (
                    <div
                        key={template.id}
                        className="bg-white/10 border border-white/10 rounded-xl p-6 hover:bg-white/20 transition-colors"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-semibold text-white">{template.name}</h3>
                            <div className="flex gap-2 items-center">
                                <VisibilityToggle templateId={template.id} initialIsPublic={template.isPublic} />
                                <Link
                                    href={`/admin/templates/${template.id}`}
                                    className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                                >
                                    <Edit size={18} />
                                </Link>
                                <form action={deleteStampTemplate.bind(null, template.id)}>
                                    <button className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                                        <Trash2 size={18} />
                                    </button>
                                </form>
                            </div>
                        </div>

                        <div className="space-y-2 text-sm text-slate-300">
                            <div className="flex justify-between">
                                <span>Size:</span>
                                <span className="font-mono">{template.width} x {template.height} cm</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Background:</span>
                                <span className="truncate max-w-[150px]">{template.backgroundUrl}</span>
                            </div>
                            <div className="pt-2 border-t border-white/10 mt-2">
                                <div className="flex justify-between text-xs text-slate-400">
                                    <span>User Image Area:</span>
                                    <span>{template.userImageWidth} x {template.userImageHeight} cm</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {templates.length === 0 && (
                    <div className="col-span-full text-center py-12 text-slate-400 bg-white/5 rounded-xl border border-dashed border-white/10">
                        <p className="text-lg">No templates found.</p>
                        <p className="text-sm mt-2">Create your first stamp template to get started.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
