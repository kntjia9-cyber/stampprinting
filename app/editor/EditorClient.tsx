"use client";


import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { StampTemplate } from "@prisma/client";

interface TemplateBackground {
    id: string;
    url: string;
    templateId: string;
}

interface ExtendedTemplate extends StampTemplate {
    backgrounds: TemplateBackground[];
    userImageColumns: number;
    userImageRows: number;
    userImageColumnSpacing: number;
    userImageRowSpacing: number;
    userImagePreviewColumnSpacing: number;
    userImagePreviewRowSpacing: number;
    realStampSampleUrl: string | null;
    realStampX: number | null;
    realStampY: number | null;
    whiteBorderWidth: number | null;
    whiteBorderHeight: number | null;
    whiteBorderX: number | null;
    whiteBorderY: number | null;
}

import { StampComposite } from "@/components/StampComposite";
import { PrintStyles } from "@/components/PrintStyles";

interface EditorClientProps {
    templates: ExtendedTemplate[];
}

export default function EditorClient({ templates }: EditorClientProps) {
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [zoom, setZoom] = useState(100);
    // Default to first template or empty string if none
    const initialTemplateId = templates && templates.length > 0 ? templates[0].id : "";
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>(initialTemplateId);
    const [customWidth, setCustomWidth] = useState<number>(5);
    const [customHeight, setCustomHeight] = useState<number>(5);
    const [isCustomSize, setIsCustomSize] = useState(false);
    const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [selectedBackgroundUrl, setSelectedBackgroundUrl] = useState<string>("");

    // Image Adjustments
    const [brightness, setBrightness] = useState(100);
    const [contrast, setContrast] = useState(100);
    const [filter, setFilter] = useState("none"); // none, grayscale, sepia, invert
    const [showPreview, setShowPreview] = useState(false);

    const handlePrint = () => {
        // Simple print command, we'll ensure the content is ready via portal
        window.print();
    };


    const handleAddToCart = async () => {
        if (!currentTemplate) {
            alert("กรุณาเลือกแบบแสตมป์");
            return;
        }

        if (!uploadedImage) {
            alert("กรุณาอัพโหลดรูปภาพ");
            return;
        }

        try {
            // Create canvas to render adjusted image
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                throw new Error("Cannot get canvas context");
            }

            // Set canvas size to match user image dimensions (in pixels)
            const imageWidth = currentTemplate.userImageWidth * 50; // Convert cm to pixels
            const imageHeight = currentTemplate.userImageHeight * 50;
            canvas.width = imageWidth;
            canvas.height = imageHeight;

            // Load the image
            const img = new Image();
            img.crossOrigin = "anonymous";

            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
                img.src = uploadedImage;
            });

            // Calculate aspect ratios to mimic object-contain
            const imgAspect = img.width / img.height;
            const targetAspect = imageWidth / imageHeight;

            let renderWidth, renderHeight;
            if (imgAspect > targetAspect) {
                renderWidth = imageWidth;
                renderHeight = imageWidth / imgAspect;
            } else {
                renderHeight = imageHeight;
                renderWidth = imageHeight * imgAspect;
            }


            // Sync transformation with CSS: scale(zoom) translate(position)
            // 1. Move to the center of the target canvas
            ctx.save();
            ctx.clearRect(0, 0, imageWidth, imageHeight);
            ctx.translate(imageWidth / 2, imageHeight / 2);

            // 2. Apply scale (zooms from the center)
            const s = zoom / 100;
            ctx.scale(s, s);

            // 3. Apply manual translation (position)
            ctx.translate(imagePosition.x, imagePosition.y);

            // 4. Draw the image (already fitted via renderWidth/Height) centered at the origin
            ctx.drawImage(img, -renderWidth / 2, -renderHeight / 2, renderWidth, renderHeight);
            ctx.restore();

            // apply manual filters for cross-browser reliability (especially mobile Safari)
            const imageData = ctx.getImageData(0, 0, imageWidth, imageHeight);
            const data = imageData.data;
            const b = brightness / 100;
            const c = contrast / 100;
            const intercept = 128 * (1 - c);

            for (let i = 0; i < data.length; i += 4) {
                let r = data[i];
                let g = data[i + 1];
                let b_val = data[i + 2];

                // Brightness
                r *= b;
                g *= b;
                b_val *= b;

                // Contrast
                r = r * c + intercept;
                g = g * c + intercept;
                b_val = b_val * c + intercept;

                // Color Filters
                if (filter === "grayscale(100%)") {
                    const gray = 0.299 * r + 0.587 * g + 0.114 * b_val;
                    r = g = b_val = gray;
                } else if (filter === "sepia(100%)") {
                    const tr = 0.393 * r + 0.769 * g + 0.189 * b_val;
                    const tg = 0.349 * r + 0.686 * g + 0.168 * b_val;
                    const tb = 0.272 * r + 0.534 * g + 0.131 * b_val;
                    r = tr; g = tg; b_val = tb;
                } else if (filter === "invert(100%)") {
                    r = 255 - r;
                    g = 255 - g;
                    b_val = 255 - b_val;
                }

                // Clamp values
                data[i] = Math.min(255, Math.max(0, r));
                data[i + 1] = Math.min(255, Math.max(0, g));
                data[i + 2] = Math.min(255, Math.max(0, b_val));
            }
            ctx.putImageData(imageData, 0, 0);

            // Convert canvas to blob
            const adjustedBlob = await new Promise<Blob>((resolve, reject) => {
                canvas.toBlob((blob) => {
                    if (blob) resolve(blob);
                    else reject(new Error("Failed to create blob"));
                }, 'image/png');
            });

            // Prepare form data
            const formData = new FormData();
            formData.append("templateId", selectedTemplateId);
            formData.append("backgroundUrl", selectedBackgroundUrl || currentTemplate.backgroundUrl);
            formData.append("quantity", "1");
            formData.append("price", "100"); // You can make this dynamic based on template
            formData.append("image", adjustedBlob, "stamp-image-adjusted.png");
            formData.append("adjustments", JSON.stringify({
                zoom,
                position: imagePosition,
                brightness,
                contrast,
                filter
            }));

            // Send to API
            const apiResponse = await fetch("/api/orders", {
                method: "POST",
                body: formData
            });

            const result = await apiResponse.json();

            if (result.success) {
                alert(result.message || "เพิ่มลงตะกร้าเรียบร้อยแล้ว!");
            } else {
                const errorMsg = result.details ? `${result.error}: ${result.details}` : (result.error || "ไม่สามารถเพิ่มลงตะกร้าได้");
                alert("เกิดข้อผิดพลาด: " + errorMsg);
            }
        } catch (error) {
            console.error("Error adding to cart:", error);
            alert("เกิดข้อผิดพลาดในการเพิ่มลงตะกร้า");
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setUploadedImage(event.target?.result as string);
                setImagePosition({ x: 0, y: 0 }); // Reset position on new upload
            };
            reader.readAsDataURL(file);
        }
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!uploadedImage) return;
        setIsDragging(true);
        setDragStart({
            x: e.clientX - imagePosition.x,
            y: e.clientY - imagePosition.y,
        });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging) {
            setImagePosition({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y,
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        if (!uploadedImage) return;
        const touch = e.touches[0];
        setIsDragging(true);
        setDragStart({
            x: touch.clientX - imagePosition.x,
            y: touch.clientY - imagePosition.y,
        });
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (isDragging) {
            const touch = e.touches[0];
            setImagePosition({
                x: touch.clientX - dragStart.x,
                y: touch.clientY - dragStart.y,
            });
        }
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
    };

    // Get current template details
    const currentTemplate = templates.find((t: ExtendedTemplate) => t.id === selectedTemplateId);

    // Update background when template changes
    useEffect(() => {
        if (currentTemplate) {
            setSelectedBackgroundUrl(currentTemplate.backgroundUrl);
        }
    }, [selectedTemplateId, currentTemplate]);

    // Calculate stamp dimensions based on selection
    const getStampDimensions = () => {
        if (isCustomSize) {
            return { width: customWidth, height: customHeight };
        }
        if (currentTemplate) {
            return { width: currentTemplate.width, height: currentTemplate.height };
        }
        return { width: 5, height: 5 }; // Fallback
    };

    const stampDimensions = getStampDimensions();
    // Convert cm to pixels for display (using 50px per cm as scale)
    const stampPixelWidth = stampDimensions.width * 50;
    const stampPixelHeight = stampDimensions.height * 50;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Global Print Styles */}
            <PrintStyles
                backgroundWidth={currentTemplate?.backgroundWidth}
                backgroundHeight={currentTemplate?.backgroundHeight}
            />
            {/* Header */}
            <header className="bg-black/30 backdrop-blur-md border-b border-white/10">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <Link href="/" className="text-2xl font-bold text-white hover:text-purple-300 transition-colors">
                        🎨 Stamp Printing App
                    </Link>
                    <div className="flex gap-4">
                        <Link
                            href="/cart"
                            className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-bold transition-all"
                        >
                            🛒 ตะกร้า
                        </Link>
                        <button
                            onClick={() => setShowPreview(true)}
                            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-bold transition-all"
                        >
                            Preview
                        </button>
                        <button
                            onClick={handlePrint}
                            className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
                        >
                            พิมพ์
                        </button>
                        <button
                            onClick={handleAddToCart}
                            className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-lg font-bold transition-all"
                        >
                            เพิ่มลงตะกร้า
                        </button>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Panel - Controls */}
                    <div className="lg:col-span-1 space-y-4">
                        {/* Upload Section */}
                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20">
                            <h2 className="text-lg font-bold text-white mb-3">📸 อัพโหลดรูป</h2>
                            <label className="block">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                    id="image-upload"
                                />
                                <div className="cursor-pointer bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-4 py-2.5 rounded-xl text-center font-bold transition-all text-sm">
                                    เลือกรูปภาพ
                                </div>
                            </label>
                        </div>

                        {/* Zoom Control */}
                        {uploadedImage && (
                            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20">
                                <h3 className="text-base font-bold text-white mb-3">🔍 ซูม</h3>
                                <input
                                    type="range"
                                    min="50"
                                    max="300"
                                    value={zoom}
                                    onChange={(e) => setZoom(Number(e.target.value))}
                                    className="w-full h-1.5 bg-purple-300 rounded-lg appearance-none cursor-pointer"
                                />
                                <p className="text-purple-200 text-center mt-1.5 text-xs">{zoom}%</p>
                            </div>
                        )}

                        {/* Image Adjustments */}
                        {uploadedImage && (
                            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20">
                                <h3 className="text-base font-bold text-white mb-3">✨ ปรับแต่งภาพ</h3>

                                <div className="space-y-3">
                                    {/* Brightness */}
                                    <div>
                                        <div className="flex justify-between text-xs text-purple-200 mb-1">
                                            <span>ความสว่าง</span>
                                            <span>{brightness}%</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="200"
                                            value={brightness}
                                            onChange={(e) => setBrightness(Number(e.target.value))}
                                            className="w-full h-1.5 bg-purple-300 rounded-lg appearance-none cursor-pointer"
                                        />
                                    </div>

                                    {/* Contrast */}
                                    <div>
                                        <div className="flex justify-between text-xs text-purple-200 mb-1">
                                            <span>ความคมชัด</span>
                                            <span>{contrast}%</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="200"
                                            value={contrast}
                                            onChange={(e) => setContrast(Number(e.target.value))}
                                            className="w-full h-1.5 bg-purple-300 rounded-lg appearance-none cursor-pointer"
                                        />
                                    </div>

                                    {/* Filters */}
                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                        <button
                                            onClick={() => setFilter("none")}
                                            className={`px-2 py-1.5 rounded-lg text-xs transition-all ${filter === "none" ? "bg-purple-600 text-white" : "bg-white/10 text-purple-200 hover:bg-white/20"}`}
                                        >
                                            ปกติ
                                        </button>
                                        <button
                                            onClick={() => setFilter("grayscale(100%)")}
                                            className={`px-2 py-1.5 rounded-lg text-xs transition-all ${filter === "grayscale(100%)" ? "bg-purple-600 text-white" : "bg-white/10 text-purple-200 hover:bg-white/20"}`}
                                        >
                                            ขาวดำ
                                        </button>
                                        <button
                                            onClick={() => setFilter("sepia(100%)")}
                                            className={`px-2 py-1.5 rounded-lg text-xs transition-all ${filter === "sepia(100%)" ? "bg-purple-600 text-white" : "bg-white/10 text-purple-200 hover:bg-white/20"}`}
                                        >
                                            ซีเปีย
                                        </button>
                                        <button
                                            onClick={() => setFilter("invert(100%)")}
                                            className={`px-2 py-1.5 rounded-lg text-xs transition-all ${filter === "invert(100%)" ? "bg-purple-600 text-white" : "bg-white/10 text-purple-200 hover:bg-white/20"}`}
                                        >
                                            กลับสี
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}



                        {/* Stamp Type */}
                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20">
                            <h3 className="text-base font-bold text-white mb-3">📐 แบบแสตมป์</h3>
                            <div className="space-y-2">
                                {templates.map((template: ExtendedTemplate) => (
                                    <div key={template.id} className="space-y-1.5">
                                        <button
                                            onClick={() => {
                                                setSelectedTemplateId(template.id);
                                                setIsCustomSize(false);
                                            }}
                                            className={`w-full px-3 py-2.5 rounded-lg transition-all text-left text-sm ${selectedTemplateId === template.id && !isCustomSize
                                                ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold"
                                                : "bg-white/10 hover:bg-white/20 text-white"
                                                }`}
                                        >
                                            {template.name}
                                        </button>

                                        {/* Background Selection Menu */}
                                        {selectedTemplateId === template.id && !isCustomSize && template.backgrounds && template.backgrounds.length > 0 && (
                                            <div className="grid grid-cols-4 gap-1.5 px-1 pb-1">
                                                {template.backgrounds.map((bg: TemplateBackground) => {
                                                    return (
                                                        <button
                                                            key={bg.id}
                                                            onClick={() => setSelectedBackgroundUrl(bg.url)}
                                                            className={`aspect-square rounded-md overflow-hidden border-2 transition-all flex items-center justify-center bg-gray-100 ${selectedBackgroundUrl === bg.url ? "border-pink-500 ring-2 ring-pink-500/50" : "border-white/10 hover:border-white/30"}`}
                                                        >
                                                            <img
                                                                src={bg.url}
                                                                alt="Background thumbnail"
                                                                className="w-full h-full object-contain"
                                                            />
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Panel - Preview */}
                    <div className="lg:col-span-2">
                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                            <h2 className="text-2xl font-bold text-white mb-6">👁️ ตัวอย่างแสตมป์</h2>

                            <div className="bg-white rounded-2xl p-8 min-h-[600px] flex items-center justify-center">
                                <div className="flex flex-row gap-8 items-center">
                                    {/* Section 2: Template Background (Modified to show composite at 20% scale) */}
                                    {currentTemplate && !isCustomSize && (
                                        <div className="flex flex-col items-center gap-2">
                                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">แบบแสตมป์ </h3>
                                            <div className="bg-white p-4 rounded-xl shadow-inner border border-gray-200">
                                                <StampComposite
                                                    template={currentTemplate}
                                                    backgroundUrl={selectedBackgroundUrl || currentTemplate.backgroundUrl}
                                                    uploadedImage={uploadedImage}
                                                    scale={21} // 42% scale
                                                    adjustments={{
                                                        zoom,
                                                        position: imagePosition,
                                                        brightness,
                                                        contrast,
                                                        filter
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Section 1: User Image (Interactive) */}
                                    <div className="flex flex-col items-center gap-2">
                                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">User Image</h3>
                                        <div
                                            className="relative overflow-hidden bg-white shadow-lg border-2 border-dashed border-gray-400 touch-none"
                                            style={{
                                                width: isCustomSize ? `${stampPixelWidth}px` : `${(currentTemplate?.userImageWidth || 0) * 50}px`,
                                                height: isCustomSize ? `${stampPixelHeight}px` : `${(currentTemplate?.userImageHeight || 0) * 50}px`,
                                            }}
                                            onMouseMove={handleMouseMove}
                                            onMouseUp={handleMouseUp}
                                            onMouseLeave={handleMouseUp}
                                            onTouchMove={handleTouchMove}
                                            onTouchEnd={handleTouchEnd}
                                        >
                                            {uploadedImage ? (
                                                <img
                                                    src={uploadedImage}
                                                    alt="Preview"
                                                    className={`w-full h-full object-contain origin-center ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
                                                    style={{
                                                        transform: `scale(${zoom / 100}) translate(${imagePosition.x}px, ${imagePosition.y}px)`,
                                                        filter: `brightness(${brightness}%) contrast(${contrast}%) ${filter !== "none" ? filter : ""}`,
                                                        touchAction: 'none'
                                                    }}
                                                    onMouseDown={handleMouseDown}
                                                    onTouchStart={handleTouchStart}
                                                    draggable={false}
                                                />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-400">
                                                    <div className="text-4xl mb-2">📷</div>
                                                    <p className="text-sm">Upload</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Preview Modal */}
            {showPreview && currentTemplate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-slate-900 border border-white/20 rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl">
                        <button
                            onClick={() => setShowPreview(false)}
                            className="absolute top-6 right-6 text-white/60 hover:text-white text-2xl"
                        >
                            ✕
                        </button>

                        <h2 className="text-3xl font-bold text-white mb-8 text-center">🏁 แบบแสตมป์ (ตัวอย่างจริง)</h2>

                        <div className="flex flex-col items-center justify-center space-y-4">
                            <div className="bg-white p-8 rounded-2xl shadow-2xl border border-gray-200">
                                <StampComposite
                                    template={currentTemplate}
                                    backgroundUrl={selectedBackgroundUrl || currentTemplate.backgroundUrl}
                                    uploadedImage={uploadedImage}
                                    scale={50} // 100% scale (actual size)
                                    adjustments={{
                                        zoom,
                                        position: imagePosition,
                                        brightness,
                                        contrast,
                                        filter
                                    }}
                                />
                            </div>
                            <p className="text-purple-300 font-medium">สัดส่วนพรีวิว 100% ของขนาดจริง</p>
                        </div>

                        <div className="flex justify-center">
                            <button
                                onClick={() => setShowPreview(false)}
                                className="px-10 py-4 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-xl font-bold text-lg shadow-xl hover:shadow-pink-500/20 transition-all"
                            >
                                กลับไปแก้ไข
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Hidden Print Area rendered via Portal to body level */}
            {typeof document !== 'undefined' && createPortal(
                <div id="print-root" className="hidden print:block">
                    <div id="print-area">
                        {currentTemplate && (
                            <StampComposite
                                template={currentTemplate}
                                backgroundUrl={selectedBackgroundUrl || currentTemplate.backgroundUrl}
                                uploadedImage={uploadedImage}
                                scale={50} // 100% scale for printing
                                isPrint={true} // Use print coordinates
                                hideRealStamp={true} // Don't print the sample layer
                                adjustments={{
                                    zoom,
                                    position: imagePosition,
                                    brightness,
                                    contrast,
                                    filter
                                }}
                            />
                        )}
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
