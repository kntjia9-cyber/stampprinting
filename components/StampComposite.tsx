"use client";

import React from "react";

interface StampTemplate {
    id: string;
    name: string;
    width: number;
    height: number;
    backgroundUrl: string;
    backgroundWidth: number;
    backgroundHeight: number;
    backgroundX: number;
    backgroundY: number;
    userImageWidth: number;
    userImageHeight: number;
    userImageX: number;
    userImageY: number;
    userImagePrintX: number | null;
    userImagePrintY: number | null;
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

interface StampCompositeProps {
    template: StampTemplate;
    backgroundUrl: string;
    uploadedImage: string | null;
    scale: number; // pixels per cm
    adjustments?: {
        zoom: number;
        position: { x: number; y: number };
        brightness: number;
        contrast: number;
        filter: string;
    };
    showBackground?: boolean;
    isPrint?: boolean;
    hideRealStamp?: boolean;
}

export function StampComposite({
    template,
    backgroundUrl,
    uploadedImage,
    scale,
    adjustments,
    showBackground = true,
    isPrint = false,
    hideRealStamp = false
}: StampCompositeProps) {
    const { zoom = 100, position = { x: 0, y: 0 }, brightness = 100, contrast = 100, filter = "none" } = adjustments || {};

    return (
        <div
            className="stamp-composite relative overflow-hidden"
            style={{
                width: isPrint ? `${template.backgroundWidth}cm` : `${template.backgroundWidth * scale}px`,
                height: isPrint ? `${template.backgroundHeight}cm` : `${template.backgroundHeight * scale}px`,
                backgroundColor: showBackground ? '#f9fafb' : 'transparent',
                printColorAdjust: 'exact',
                WebkitPrintColorAdjust: 'exact'
            }}
        >
            {/* Background Image Layer (0) */}
            {showBackground && backgroundUrl && (
                <div className="absolute inset-0">
                    <img
                        src={backgroundUrl}
                        alt="Background"
                        className={`w-full h-full object-contain`}
                    />
                </div>
            )}
            {/* 1. Print Zone (White Rectangle) - Print Only */}
            {isPrint && template.whiteBorderWidth && template.whiteBorderHeight && (
                <div
                    className="absolute pointer-events-none bg-white"
                    style={{
                        left: `${(template.whiteBorderX || 0)}cm`,
                        top: `${(template.whiteBorderY || 0)}cm`,
                        width: `${template.whiteBorderWidth}cm`,
                        height: `${template.whiteBorderHeight}cm`,
                    }}
                />
            )}

            {/* 2. Real Stamp Sample layer (Middle) */}
            {template.realStampSampleUrl && !hideRealStamp && (
                <div
                    className="absolute pointer-events-none"
                    style={{
                        left: isPrint ? `${(template.realStampX || 0)}cm` : `${(template.realStampX || 0) * scale}px`,
                        top: isPrint ? `${(template.realStampY || 0)}cm` : `${(template.realStampY || 0) * scale}px`,
                        width: '100%',
                        height: '100%',
                    }}
                >
                    <img
                        src={template.realStampSampleUrl}
                        alt="Real Stamp Sample"
                        className="w-full h-full object-contain opacity-80"
                        style={{ transform: 'scale(0.68)' }}
                    />
                </div>
            )}

            {/* 3. User Uploaded Image Layer(s) (Grid - Top) */}
            {(() => {
                const cols = template.userImageColumns || 1;
                const rows = template.userImageRows || 1;
                const layouts = [];

                // Determine spacing based on mode
                const colSpacing = isPrint
                    ? (template.userImageColumnSpacing || 0)
                    : (template.userImagePreviewColumnSpacing || 0);

                const rowSpacing = isPrint
                    ? (template.userImageRowSpacing || 0)
                    : (template.userImagePreviewRowSpacing || 0);

                for (let r = 0; r < rows; r++) {
                    for (let c = 0; c < cols; c++) {
                        const index = r * cols + c;
                        const xPos = (isPrint ? template.userImagePrintX ?? template.userImageX : template.userImageX) + (c * (template.userImageWidth + colSpacing));
                        const yPos = (isPrint ? template.userImagePrintY ?? template.userImageY : template.userImageY) + (r * (template.userImageHeight + rowSpacing));

                        layouts.push(
                            <div
                                key={index}
                                className="absolute overflow-hidden"
                                style={{
                                    left: isPrint ? `${xPos}cm` : `${xPos * scale}px`,
                                    top: isPrint ? `${yPos}cm` : `${yPos * scale}px`,
                                    width: isPrint ? `${template.userImageWidth}cm` : `${template.userImageWidth * scale}px`,
                                    height: isPrint ? `${template.userImageHeight}cm` : `${template.userImageHeight * scale}px`,
                                }}
                            >
                                {uploadedImage ? (
                                    <img
                                        src={uploadedImage}
                                        alt={`User content ${index + 1}`}
                                        className={`w-full h-full pointer-events-none object-contain`}
                                        style={{
                                            transform: `scale(${zoom / 100}) translate(${position.x * (scale / 50)}px, ${position.y * (scale / 50)}px)`,
                                            filter: `brightness(${brightness}%) contrast(${contrast}%) ${filter !== "none" ? filter : ""}`,
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-100/30 flex items-center justify-center text-[8px] text-gray-400">
                                        (No Image)
                                    </div>
                                )}
                            </div>
                        );
                    }
                }
                return layouts;
            })()}
        </div>
    );
}
