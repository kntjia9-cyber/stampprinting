"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Smartphone, Scan, ArrowBigDown } from "lucide-react";

export function QRCodeSection() {
    const [url, setUrl] = useState("");

    useEffect(() => {
        // Get current URL in browser
        setUrl(window.location.host === "localhost:3000" ? "http://localhost:3000" : window.location.origin);
    }, []);

    if (!url) return null;

    return (
        <div className="mt-20 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 max-w-4xl mx-auto shadow-2xl">
            <div className="grid md:grid-cols-2 gap-10 items-center">
                <div className="space-y-6">
                    <div className="flex items-center gap-3 text-purple-400">
                        <Scan size={32} />
                        <h2 className="text-3xl font-bold text-white text-left">สแกนเพื่อติดตั้งแอป</h2>
                    </div>

                    <p className="text-purple-200 text-lg leading-relaxed text-left">
                        เปิดกล้องมือถือสแกนคิวอาร์โค้ด เพื่อใช้งานแอปบนมือถือได้ทันที
                        <span className="block mt-2 text-white font-semibold">
                            กดปุ่ม "Add to Home Screen" เพื่อสร้างไอคอนแอปบนหน้าจอมือถือคุณ
                        </span>
                    </p>

                    <div className="space-y-4">
                        <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                            <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 shrink-0">
                                <span className="font-bold">iOS</span>
                            </div>
                            <p className="text-sm text-slate-300 text-left">กดปุ่ม <span className="text-white font-bold">แชร์</span> ใน Safari แล้วเลือก <span className="text-white font-bold">"Add to Home Screen"</span></p>
                        </div>

                        <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                            <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center text-green-400 shrink-0">
                                <span className="font-bold">And</span>
                            </div>
                            <p className="text-sm text-slate-300 text-left">กด <span className="text-white font-bold">จุด 3 จุด</span> ใน Chrome แล้วเลือก <span className="text-white font-bold">"ติดตั้งแอป"</span></p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="bg-white p-6 rounded-3xl shadow-[0_0_50px_rgba(168,85,247,0.4)] border-4 border-purple-500/30">
                        <QRCodeSVG
                            value={url}
                            size={200}
                            level="H"
                            includeMargin={false}
                            imageSettings={{
                                src: "/icon.png",
                                x: undefined,
                                y: undefined,
                                height: 40,
                                width: 40,
                                excavate: true,
                            }}
                        />
                    </div>
                    <div className="flex items-center gap-2 text-purple-300 animate-bounce mt-4">
                        <ArrowBigDown size={20} />
                        <span className="text-sm font-medium">สแกนเลย</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
