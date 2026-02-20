
"use client";

import { useFormStatus } from "react-dom";
import { useState } from "react";
import { createStampTemplate, updateStampTemplate } from "@/app/actions/stamp-templates";

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {pending ? "Saving..." : "Save Template"}
        </button>
    );
}

interface TemplateFormProps {
    template?: any; // Using any for flexibility with backgrounds relation
}

export default function TemplateForm({ template }: TemplateFormProps) {
    const [previews, setPreviews] = useState<{ [key: number]: string }>(() => {
        const initialPreviews: { [key: number]: string } = {};
        if (template?.backgrounds) {
            template.backgrounds.forEach((bg: any, i: number) => {
                initialPreviews[i] = bg.url;
            });
        }
        return initialPreviews;
    });

    const [isPublic, setIsPublic] = useState<boolean>(template?.isPublic ?? true);

    const action = template
        ? updateStampTemplate.bind(null, template.id)
        : createStampTemplate;

    const handleFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setPreviews(prev => ({ ...prev, [index]: url }));
        }
    };

    return (
        <form
            action={action}
            className="space-y-6 max-w-2xl bg-white/5 p-8 rounded-xl border border-white/10"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex gap-4 col-span-full">
                    <div className="flex-[2]">
                        <label className="block text-sm font-medium text-slate-300 mb-1">Template Name</label>
                        <input
                            name="name"
                            defaultValue={template?.name}
                            required
                            className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="e.g. Square Small (3x3 cm)"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-slate-300 mb-1">Price (Baht)</label>
                        <input
                            name="price"
                            type="number"
                            step="0.01"
                            defaultValue={template?.price || 100}
                            required
                            className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                </div>

                <div className="col-span-full flex items-center gap-3 bg-slate-800/50 p-4 rounded-lg border border-white/5">
                    <input
                        type="checkbox"
                        name="isPublic"
                        id="isPublic"
                        checked={isPublic}
                        onChange={(e) => setIsPublic(e.target.checked)}
                        className="w-5 h-5 rounded border-slate-600 text-purple-600 focus:ring-purple-500 bg-slate-700"
                    />
                    <label htmlFor="isPublic" className="text-sm font-medium text-slate-200 cursor-pointer select-none">
                        Publicly Visible (Show in Editor)
                    </label>
                </div>

                <div className="col-span-full flex gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-slate-300 mb-1">Width (cm)</label>
                        <input
                            name="width"
                            type="number"
                            step="0.01"
                            defaultValue={template?.width}
                            required
                            className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-slate-300 mb-1">Height (cm)</label>
                        <input
                            name="height"
                            type="number"
                            step="0.01"
                            defaultValue={template?.height}
                            required
                            className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                </div>

                <div className="col-span-full">
                    <label className="block text-sm font-medium text-slate-300 mb-1">Main Background Image URL</label>
                    <input
                        name="backgroundUrl"
                        defaultValue={template?.backgroundUrl}
                        required
                        className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="/templates/your-image.png"
                    />
                </div>

                <div className="col-span-full grid grid-cols-2 gap-4">
                    <h3 className="col-span-full text-md font-semibold text-purple-300 mt-2">Alternative Backgrounds (Optional)</h3>
                    {[0, 1, 2, 3].map((i) => (
                        <div key={i} className="space-y-2">
                            <label className="block text-xs font-medium text-slate-400 mb-1">Alt Background {i + 1}</label>

                            {/* Hidden field to keep existing URL if no new file is uploaded */}
                            <input type="hidden" name={`background-${i}-existing`} defaultValue={template?.backgrounds?.[i]?.url} />

                            <div className="flex items-center gap-3">
                                <div className="w-16 h-16 rounded-lg bg-slate-800 border border-white/10 overflow-hidden flex-shrink-0">
                                    {previews[i] ? (
                                        <img src={previews[i]} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-500">No img</div>
                                    )}
                                </div>
                                <input
                                    name={`background-${i}`}
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(i, e)}
                                    className="block w-full text-xs text-slate-400
                                        file:mr-3 file:py-1.5 file:px-3
                                        file:rounded-full file:border-0
                                        file:text-xs file:font-semibold
                                        file:bg-purple-600 file:text-white
                                        hover:file:bg-purple-700
                                        cursor-pointer"
                                />
                            </div>
                        </div>
                    ))}
                </div>

                <h3 className="col-span-full text-lg font-semibold text-white mt-4 border-b border-white/10 pb-2">Background Print Settings</h3>

                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Bg Width (cm)</label>
                    <input
                        name="backgroundWidth"
                        type="number"
                        step="0.01"
                        defaultValue={template?.backgroundWidth}
                        required
                        className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Bg Height (cm)</label>
                    <input
                        name="backgroundHeight"
                        type="number"
                        step="0.01"
                        defaultValue={template?.backgroundHeight}
                        required
                        className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Bg X Position (cm)</label>
                    <input
                        name="backgroundX"
                        type="number"
                        step="0.01"
                        defaultValue={template?.backgroundX}
                        required
                        className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Bg Y Position (cm)</label>
                    <input
                        name="backgroundY"
                        type="number"
                        step="0.01"
                        defaultValue={template?.backgroundY}
                        required
                        className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                </div>

                <h3 className="col-span-full text-lg font-semibold text-white mt-4 border-b border-white/10 pb-2">User Image Settings</h3>

                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Img Width (cm)</label>
                    <input
                        name="userImageWidth"
                        type="number"
                        step="0.01"
                        defaultValue={template?.userImageWidth}
                        required
                        className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Img Height (cm)</label>
                    <input
                        name="userImageHeight"
                        type="number"
                        step="0.01"
                        defaultValue={template?.userImageHeight}
                        required
                        className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Img X (Preview) (cm)</label>
                    <input
                        name="userImageX"
                        type="number"
                        step="0.01"
                        defaultValue={template?.userImageX}
                        required
                        className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Img Y (Preview) (cm)</label>
                    <input
                        name="userImageY"
                        type="number"
                        step="0.01"
                        defaultValue={template?.userImageY}
                        required
                        className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Img X (Print) (cm)</label>
                    <input
                        name="userImagePrintX"
                        type="number"
                        step="0.01"
                        defaultValue={template?.userImagePrintX}
                        className="w-full bg-slate-800 border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Fallback to Preview if empty"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Img Y (Print) (cm)</label>
                    <input
                        name="userImagePrintY"
                        type="number"
                        step="0.01"
                        defaultValue={template?.userImagePrintY}
                        className="w-full bg-slate-800 border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Fallback to Preview if empty"
                    />
                </div>

                <div className="col-span-full grid grid-cols-2 gap-4 pb-4 border-b border-white/10">
                    <h3 className="col-span-full text-lg font-semibold text-white mt-4">Grid Layout (User Images)</h3>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Columns</label>
                        <input
                            name="userImageColumns"
                            type="number"
                            defaultValue={template?.userImageColumns || 1}
                            required
                            className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Rows</label>
                        <input
                            name="userImageRows"
                            type="number"
                            defaultValue={template?.userImageRows || 1}
                            required
                            className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Column Spacing (Print) (cm)</label>
                        <input
                            name="userImageColumnSpacing"
                            type="number"
                            step="0.01"
                            defaultValue={template?.userImageColumnSpacing || 0}
                            required
                            className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Row Spacing (Print) (cm)</label>
                        <input
                            name="userImageRowSpacing"
                            type="number"
                            step="0.01"
                            defaultValue={template?.userImageRowSpacing || 0}
                            required
                            className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Column Spacing (Preview) (cm)</label>
                        <input
                            name="userImagePreviewColumnSpacing"
                            type="number"
                            step="0.01"
                            defaultValue={template?.userImagePreviewColumnSpacing || 0}
                            className="w-full bg-slate-800 border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Defaults to 0"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Row Spacing (Preview) (cm)</label>
                        <input
                            name="userImagePreviewRowSpacing"
                            type="number"
                            step="0.01"
                            defaultValue={template?.userImagePreviewRowSpacing || 0}
                            className="w-full bg-slate-800 border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Defaults to 0"
                        />
                    </div>
                </div>

                <div className="col-span-full grid grid-cols-2 gap-4 pb-4 border-b border-white/10">
                    <h3 className="col-span-full text-lg font-semibold text-white mt-4">Real Stamp Sample</h3>
                    <div className="col-span-full">
                        <label className="block text-sm font-medium text-slate-300 mb-1">Sample Image URL / File</label>
                        <div className="flex gap-4 items-center">
                            <input
                                name="realStampSampleUrl"
                                defaultValue={template?.realStampSampleUrl}
                                className="flex-1 bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="/path/to/sample.png"
                            />
                            <input
                                name="realStampFile"
                                type="file"
                                accept="image/*"
                                className="text-xs text-slate-400 file:mr-3 file:py-1 file:px-2 file:rounded-full file:border-0 file:bg-purple-600 file:text-white"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Sample X Position (cm)</label>
                        <input
                            name="realStampX"
                            type="number"
                            step="0.01"
                            defaultValue={template?.realStampX}
                            className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Sample Y Position (cm)</label>
                        <input
                            name="realStampY"
                            type="number"
                            step="0.01"
                            defaultValue={template?.realStampY}
                            className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                </div>

                <div className="col-span-full grid grid-cols-2 gap-4 pb-4 border-b border-white/10">
                    <h3 className="col-span-full text-lg font-semibold text-white mt-4">Print Zone (White Rectangle) - Print Only</h3>
                    <div className="col-span-full text-sm text-slate-400 mb-2">
                        Define a white rectangle area that will be rendered only during printing. This is useful for masking or defining the printable area.
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Zone Width (cm)</label>
                        <input
                            name="whiteBorderWidth"
                            type="number"
                            step="0.01"
                            defaultValue={template?.whiteBorderWidth}
                            className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Zone Height (cm)</label>
                        <input
                            name="whiteBorderHeight"
                            type="number"
                            step="0.01"
                            defaultValue={template?.whiteBorderHeight}
                            className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Zone X Position (cm)</label>
                        <input
                            name="whiteBorderX"
                            type="number"
                            step="0.01"
                            defaultValue={template?.whiteBorderX}
                            className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Zone Y Position (cm)</label>
                        <input
                            name="whiteBorderY"
                            type="number"
                            step="0.01"
                            defaultValue={template?.whiteBorderY}
                            className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-white/10">
                <SubmitButton />
            </div>
        </form>
    );
}
