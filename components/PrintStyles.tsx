"use client";

import React from "react";

interface PrintStylesProps {
    backgroundWidth?: number;
    backgroundHeight?: number;
}

export function PrintStyles({ backgroundWidth, backgroundHeight }: PrintStylesProps) {
    return (
        <style jsx global>{`
            @media print {
                @page {
                    margin: 0;
                    size: ${backgroundWidth && backgroundHeight ? `${backgroundWidth}cm ${backgroundHeight}cm` : 'auto'};
                }
                html, body {
                    margin: 0 !important;
                    padding: 0 !important;
                    height: 100% !important;
                    width: 100% !important;
                    overflow: visible !important;
                    background: white !important;
                }
                /* Hide everything except print area */
                body > *:not(#print-root) {
                    display: none !important;
                }
                #print-root {
                    display: block !important;
                    position: absolute !important;
                    top: 0 !important;
                    left: 0 !important;
                    width: 100% !important;
                    height: 100% !important;
                    z-index: 99999 !important;
                    background: white !important;
                }
                #print-area {
                    display: block !important;
                    visibility: visible !important;
                    width: ${backgroundWidth ? `${backgroundWidth}cm` : '100%'} !important;
                    height: ${backgroundHeight ? `${backgroundHeight}cm` : '100%'} !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    overflow: hidden !important;
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }
            }
        `}</style>
    );
}
