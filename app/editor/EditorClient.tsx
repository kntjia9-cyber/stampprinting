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
    price: number;
}

interface PlacedSticker {
    id: string;
    content: string;
    x: number;
    y: number;
    scale: number;
    rotation: number;
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

    // Stickers State
    const [placedStickers, setPlacedStickers] = useState<PlacedSticker[]>([]);
    const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"templates" | "stickers">("templates");
    const [stickerCategory, setStickerCategory] = useState<"hearts" | "cute" | "emojis" | "frames" | "flowers">("hearts");

    const stickerOptions = {
        hearts: ["❤️", "💖", "💝", "💕", "💗", "💓"],
        cute: ["🐱", "🐶", "🐰", "🐼", "🦊", "🐻", "🦁", "🐵"],
        emojis: ["😊", "😎", "🌈", "✨", "🔥", "⭐", "🍀", "🎨"],
        frames: ["🖼️", "💟", "✨", "💫", "💠", "🔳", "⭕", "❌"],
        flowers: ["🌸", "🌹", "🌻", "🌼", "🌷", "🌺", "💮", "🌵"]
    };

    const addSticker = (content: string) => {
        const newSticker: PlacedSticker = {
            id: Math.random().toString(36).substr(2, 9),
            content,
            x: 50,
            y: 50,
            scale: 1,
            rotation: 0
        };
        setPlacedStickers([...placedStickers, newSticker]);
        setSelectedStickerId(newSticker.id);
    };

    const updateSelectedSticker = (updates: Partial<PlacedSticker>) => {
        if (!selectedStickerId) return;
        setPlacedStickers(placedStickers.map(s =>
            s.id === selectedStickerId ? { ...s, ...updates } : s
        ));
    };

    const deleteSelectedSticker = () => {
        if (!selectedStickerId) return;
        setPlacedStickers(placedStickers.filter(s => s.id !== selectedStickerId));
        setSelectedStickerId(null);
    };

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
            formData.append("price", (currentTemplate.price || 100).toString()); // Use template price
            formData.append("image", adjustedBlob, "stamp-image-adjusted.png");
            formData.append("adjustments", JSON.stringify({
                zoom,
                position: imagePosition,
                brightness,
                contrast,
                filter,
                placedStickers // Save stickers metadata
            }));

            // Sync with canvas rendering (Add stickers to canvas)
            const stickersToDraw = placedStickers;
            for (const sticker of stickersToDraw) {
                ctx.save();
                // Position is 0-100% relative to user image canvas
                const targetX = (sticker.x / 100) * imageWidth;
                const targetY = (sticker.y / 100) * imageHeight;
                ctx.translate(targetX, targetY);
                ctx.rotate((sticker.rotation * Math.PI) / 180);

                // Calculate font size relative to canvas height (matching 25% base size)
                const canvasFontSize = imageHeight * 0.25 * sticker.scale;
                ctx.font = `${canvasFontSize}px Arial`;
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(sticker.content, 0, 0);
                ctx.restore();
            }

            // Re-create blob with stickers
            const finalBlobWithStickers = await new Promise<Blob>((resolve, reject) => {
                canvas.toBlob((blob) => {
                    if (blob) resolve(blob);
                    else reject(new Error("Failed to create final blob"));
                }, 'image/png');
            });

            // Rewrite form data image
            formData.set("image", finalBlobWithStickers, "stamp-image-adjusted.png");

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

    const [isDraggingStickerId, setIsDraggingStickerId] = useState<string | null>(null);

    const handleMouseDown = (e: React.MouseEvent, stickerId: string | null = null) => {
        if (!uploadedImage) return;

        if (stickerId) {
            setIsDraggingStickerId(stickerId);
            setSelectedStickerId(stickerId);
            setIsDragging(true);
            const sticker = placedStickers.find(s => s.id === stickerId);
            if (sticker) {
                // Get container dimensions to calculate relative offset
                const rect = e.currentTarget.parentElement?.getBoundingClientRect();
                if (rect) {
                    setDragStart({
                        x: e.clientX,
                        y: e.clientY,
                    });
                }
            }
        } else {
            setIsDraggingStickerId(null);
            setIsDragging(true);
            setDragStart({
                x: e.clientX - imagePosition.x,
                y: e.clientY - imagePosition.y,
            });
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging) {
            if (isDraggingStickerId) {
                // Move sticker
                const rect = e.currentTarget.getBoundingClientRect();
                if (rect) {
                    const xPercent = ((e.clientX - rect.left) / rect.width) * 100;
                    const yPercent = ((e.clientY - rect.top) / rect.height) * 100;

                    setPlacedStickers(prev => prev.map(s =>
                        s.id === isDraggingStickerId ? { ...s, x: xPercent, y: yPercent } : s
                    ));
                }
            } else {
                // Move background image
                setImagePosition({
                    x: e.clientX - dragStart.x,
                    y: e.clientY - dragStart.y,
                });
            }
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        setIsDraggingStickerId(null);
    };

    const handleTouchStart = (e: React.TouchEvent, stickerId: string | null = null) => {
        if (!uploadedImage) return;
        const touch = e.touches[0];

        if (stickerId) {
            setIsDraggingStickerId(stickerId);
            setSelectedStickerId(stickerId);
            setIsDragging(true);
            setDragStart({ x: touch.clientX, y: touch.clientY });
        } else {
            setIsDraggingStickerId(null);
            setIsDragging(true);
            setDragStart({
                x: touch.clientX - imagePosition.x,
                y: touch.clientY - imagePosition.y,
            });
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (isDragging) {
            const touch = e.touches[0];
            if (isDraggingStickerId) {
                const rect = e.currentTarget.getBoundingClientRect();
                if (rect) {
                    const xPercent = ((touch.clientX - rect.left) / rect.width) * 100;
                    const yPercent = ((touch.clientY - rect.top) / rect.height) * 100;
                    setPlacedStickers(prev => prev.map(s =>
                        s.id === isDraggingStickerId ? { ...s, x: xPercent, y: yPercent } : s
                    ));
                }
            } else {
                setImagePosition({
                    x: touch.clientX - dragStart.x,
                    y: touch.clientY - dragStart.y,
                });
            }
        }
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
        setIsDraggingStickerId(null);
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
            <header className="bg-black/30 backdrop-blur-md border-b border-white/10 sticky top-0 z-40">
                <div className="container mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <Link href="/" className="text-xl md:text-2xl font-bold text-white hover:text-purple-300 transition-colors">
                        🎨 Stamp Printing App
                    </Link>
                    <div className="flex flex-wrap justify-center gap-2 md:gap-4">
                        <Link
                            href="/cart"
                            className="px-3 md:px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-bold transition-all text-sm"
                        >
                            🛒 ตะกร้า
                        </Link>
                        <button
                            onClick={() => setShowPreview(true)}
                            className="px-3 md:px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-bold transition-all text-sm"
                        >
                            Preview
                        </button>
                        <button
                            onClick={handlePrint}
                            className="px-3 md:px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all text-sm"
                        >
                            พิมพ์
                        </button>
                        <button
                            onClick={handleAddToCart}
                            className="px-3 md:px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-lg font-bold transition-all text-sm"
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
                        {/* Tabs */}
                        <div className="flex bg-white/10 backdrop-blur-lg rounded-xl p-1 border border-white/10">
                            <button
                                onClick={() => setActiveTab("templates")}
                                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === "templates" ? "bg-purple-600 text-white shadow-lg" : "text-purple-200 hover:bg-white/5"}`}
                            >
                                📐 แบบ&ปรับรูป
                            </button>
                            <button
                                onClick={() => setActiveTab("stickers")}
                                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === "stickers" ? "bg-purple-600 text-white shadow-lg" : "text-purple-200 hover:bg-white/5"}`}
                            >
                                ✨ สติ๊กเกอร์
                            </button>
                        </div>

                        {activeTab === "templates" ? (
                            <>
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

                                {/* Image Tools - Zoom & Adjustments */}
                                {uploadedImage && (
                                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20">
                                        <h3 className="text-base font-bold text-white mb-4">⚒️ เครื่องมือปรับภาพ</h3>

                                        <div className="flex justify-around items-end gap-2 pb-2">
                                            {/* Zoom */}
                                            <div className="flex flex-col items-center gap-2">
                                                <span className="text-[10px] text-purple-200 text-center h-8 leading-tight">ซูม<br />{zoom}%</span>
                                                <input
                                                    type="range"
                                                    min="50"
                                                    max="300"
                                                    value={zoom}
                                                    onChange={(e) => setZoom(Number(e.target.value))}
                                                    className="range-vertical transition-all accent-purple-500 cursor-pointer"
                                                />
                                            </div>

                                            {/* Brightness */}
                                            <div className="flex flex-col items-center gap-2">
                                                <span className="text-[10px] text-purple-200 text-center h-8 leading-tight">ความสว่าง<br />{brightness}%</span>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="200"
                                                    value={brightness}
                                                    onChange={(e) => setBrightness(Number(e.target.value))}
                                                    className="range-vertical transition-all accent-purple-500 cursor-pointer"
                                                />
                                            </div>

                                            {/* Contrast */}
                                            <div className="flex flex-col items-center gap-2">
                                                <span className="text-[10px] text-purple-200 text-center h-8 leading-tight">คมชัด<br />{contrast}%</span>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="200"
                                                    value={contrast}
                                                    onChange={(e) => setContrast(Number(e.target.value))}
                                                    className="range-vertical transition-all accent-purple-500 cursor-pointer"
                                                />
                                            </div>
                                        </div>

                                        {/* Filters */}
                                        <div className="grid grid-cols-4 gap-2 mt-6">
                                            <button
                                                onClick={() => setFilter("none")}
                                                className={`px-1 py-1.5 rounded-lg text-[10px] transition-all ${filter === "none" ? "bg-purple-600 text-white" : "bg-white/10 text-purple-200 hover:bg-white/20"}`}
                                            >
                                                ปกติ
                                            </button>
                                            <button
                                                onClick={() => setFilter("grayscale(100%)")}
                                                className={`px-1 py-1.5 rounded-lg text-[10px] transition-all ${filter === "grayscale(100%)" ? "bg-purple-600 text-white" : "bg-white/10 text-purple-200 hover:bg-white/20"}`}
                                            >
                                                ขาวดำ
                                            </button>
                                            <button
                                                onClick={() => setFilter("sepia(100%)")}
                                                className={`px-1 py-1.5 rounded-lg text-[10px] transition-all ${filter === "sepia(100%)" ? "bg-purple-600 text-white" : "bg-white/10 text-purple-200 hover:bg-white/20"}`}
                                            >
                                                ซีเปีย
                                            </button>
                                            <button
                                                onClick={() => setFilter("invert(100%)")}
                                                className={`px-1 py-1.5 rounded-lg text-[10px] transition-all ${filter === "invert(100%)" ? "bg-purple-600 text-white" : "bg-white/10 text-purple-200 hover:bg-white/20"}`}
                                            >
                                                กลับสี
                                            </button>
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
                                                    className={`w-full px-3 py-2.5 rounded-lg transition-all text-left text-sm flex justify-between items-center ${selectedTemplateId === template.id && !isCustomSize
                                                        ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold"
                                                        : "bg-white/10 hover:bg-white/20 text-white"
                                                        }`}
                                                >
                                                    <span>{template.name}</span>
                                                    <span className={`${selectedTemplateId === template.id && !isCustomSize ? "text-white" : "text-purple-300"} font-bold`}>
                                                        {template.price} ฿
                                                    </span>
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
                            </>
                        ) : (
                            /* Stickers Panel */
                            <div className="space-y-4">
                                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20">
                                    <h3 className="text-base font-bold text-white mb-3">✨ เลือกสติ๊กเกอร์</h3>

                                    {/* Category Selector */}
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {(["hearts", "cute", "emojis", "frames", "flowers"] as const).map((cat) => (
                                            <button
                                                key={cat}
                                                onClick={() => setStickerCategory(cat)}
                                                className={`px-3 py-1.5 rounded-lg text-xs capitalize transition-all ${stickerCategory === cat ? "bg-purple-600 text-white" : "bg-white/10 text-purple-200"}`}
                                            >
                                                {cat === "hearts" ? "❤️" :
                                                    cat === "cute" ? "🐱" :
                                                        cat === "emojis" ? "✨" :
                                                            cat === "frames" ? "🖼️" : "🌸"}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Stickers Grid */}
                                    <div className="grid grid-cols-4 gap-2">
                                        {stickerOptions[stickerCategory].map((emoji, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => addSticker(emoji)}
                                                className="aspect-square bg-white/5 hover:bg-white/20 rounded-xl flex items-center justify-center text-2xl transition-all hover:scale-110"
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Selected Sticker Controls */}
                                {selectedStickerId && (
                                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-pink-500/50 animate-in fade-in zoom-in duration-300">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-sm font-bold text-white">⚙️ ปรับแต่งสติ๊กเกอร์</h3>
                                            <button
                                                onClick={deleteSelectedSticker}
                                                className="text-red-400 hover:text-red-300 transition-colors"
                                            >
                                                🗑️ ลบ
                                            </button>
                                        </div>

                                        <div className="space-y-4">
                                            {/* Scale */}
                                            <div>
                                                <div className="flex justify-between text-[10px] text-purple-200 mb-1">
                                                    <span>ขนาด</span>
                                                    <span>{Math.round((placedStickers.find(s => s.id === selectedStickerId)?.scale || 1) * 100)}%</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="0.2"
                                                    max="3"
                                                    step="0.1"
                                                    value={placedStickers.find(s => s.id === selectedStickerId)?.scale || 1}
                                                    onChange={(e) => updateSelectedSticker({ scale: Number(e.target.value) })}
                                                    className="w-full h-1.5 bg-purple-300 rounded-lg appearance-none cursor-pointer accent-purple-600"
                                                />
                                            </div>

                                            {/* Rotation */}
                                            <div>
                                                <div className="flex justify-between text-[10px] text-purple-200 mb-1">
                                                    <span>หมุน</span>
                                                    <span>{placedStickers.find(s => s.id === selectedStickerId)?.rotation || 0}°</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="-180"
                                                    max="180"
                                                    value={placedStickers.find(s => s.id === selectedStickerId)?.rotation || 0}
                                                    onChange={(e) => updateSelectedSticker({ rotation: Number(e.target.value) })}
                                                    className="w-full h-1.5 bg-purple-300 rounded-lg appearance-none cursor-pointer accent-purple-600"
                                                />
                                            </div>

                                            <p className="text-[10px] text-purple-300 italic text-center">
                                                * คลิกหรือแตะที่สติ๊กเกอร์บนรูปเพื่อลากย้ายตำแหน่ง
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right Panel - Preview */}
                    <div className="lg:col-span-2 order-first lg:order-last">
                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 md:p-8 border border-white/20">
                            <h2 className="text-xl md:text-2xl font-bold text-white mb-6">👁️ ตัวอย่างแสตมป์</h2>

                            <div className="bg-white rounded-2xl p-4 md:p-8 min-h-[400px] md:min-h-[600px] flex items-center justify-center overflow-x-auto">
                                <div className="flex flex-col md:flex-row gap-8 items-center py-4">
                                    {/* Section 2: Template Background (Modified to show composite at 20% scale) */}
                                    {currentTemplate && !isCustomSize && (
                                        <div className="flex flex-col items-center gap-2">
                                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">แบบแสตมป์ </h3>
                                            <div className="bg-white p-4 rounded-xl shadow-inner border border-gray-200">
                                                <StampComposite
                                                    template={currentTemplate}
                                                    backgroundUrl={selectedBackgroundUrl || currentTemplate.backgroundUrl}
                                                    uploadedImage={uploadedImage}
                                                    showBackground={true}
                                                    placedStickers={placedStickers}
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
                                                <>
                                                    <img
                                                        src={uploadedImage}
                                                        alt="Preview"
                                                        className={`w-full h-full object-contain origin-center ${isDragging && !isDraggingStickerId ? "cursor-grabbing" : "cursor-grab"}`}
                                                        style={{
                                                            transform: `scale(${zoom / 100}) translate(${imagePosition.x}px, ${imagePosition.y}px)`,
                                                            filter: `brightness(${brightness}%) contrast(${contrast}%) ${filter !== "none" ? filter : ""}`,
                                                            touchAction: 'none'
                                                        }}
                                                        onMouseDown={(e) => handleMouseDown(e)}
                                                        onTouchStart={(e) => handleTouchStart(e)}
                                                        draggable={false}
                                                    />
                                                    {/* Interactive Stickers */}
                                                    {placedStickers.map((sticker) => {
                                                        const slotHeightPx = (currentTemplate?.userImageHeight || 0) * 50;
                                                        const baseFontSizePx = slotHeightPx * 0.25;
                                                        const finalFontSize = `${baseFontSizePx * sticker.scale}px`;

                                                        return (
                                                            <div
                                                                key={sticker.id}
                                                                className={`absolute flex items-center justify-center select-none cursor-move transition-shadow ${selectedStickerId === sticker.id ? "ring-2 ring-pink-500 bg-pink-500/10" : "hover:bg-white/10"}`}
                                                                style={{
                                                                    left: `${sticker.x}%`,
                                                                    top: `${sticker.y}%`,
                                                                    transform: `translate(-50%, -50%) scale(1) rotate(${sticker.rotation}deg)`,
                                                                    fontSize: finalFontSize,
                                                                    zIndex: 20
                                                                }}
                                                                onMouseDown={(e) => {
                                                                    e.stopPropagation();
                                                                    handleMouseDown(e, sticker.id);
                                                                }}
                                                                onTouchStart={(e) => {
                                                                    e.stopPropagation();
                                                                    handleTouchStart(e, sticker.id);
                                                                }}
                                                            >
                                                                {sticker.content}
                                                            </div>
                                                        );
                                                    })}
                                                </>
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
                                    placedStickers={placedStickers}
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
                                placedStickers={placedStickers}
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
