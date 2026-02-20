"use client";

import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Share, Smartphone, SmartphoneNfc } from "lucide-react";

export default function InstallSection() {
    const [isIOS, setIsIOS] = useState(false);
    const [currentUrl, setCurrentUrl] = useState("");

    useEffect(() => {
        setCurrentUrl(window.location.origin);
        const userAgent = window.navigator.userAgent.toLowerCase();
        setIsIOS(/iphone|ipad|ipod/.test(userAgent));
    }, []);

    return (
        <div className="max-w-4xl mx-auto mt-16 px-4">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl overflow-hidden shadow-2xl">
                <div className="grid md:grid-cols-2">
                    {/* Left Side: QR Code (Hidden on mobile browsers, shown on desktop) */}
                    <div className="p-8 bg-gradient-to-br from-purple-600/20 to-blue-600/20 border-b md:border-b-0 md:border-r border-white/10 flex flex-col items-center justify-center text-center">
                        <div className="bg-white p-4 rounded-2xl mb-4 shadow-xl">
                            <QRCodeSVG value={currentUrl || "https://stamp-app.vercel.app"} size={160} />
                        </div>
                        <h3 className="text-white font-bold text-xl mb-2">สแกนเข้าสู่แอป</h3>
                        <p className="text-purple-200 text-sm">สแกนด้วยกล้องมือถือเพื่อเริ่มสร้างแสตมป์ทันที</p>
                    </div>

                    {/* Right Side: Install Instructions */}
                    <div className="p-8 flex flex-col justify-center">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-purple-500/20 p-2 rounded-lg border border-purple-500/30 font-bold">
                                <Smartphone className="text-purple-400" size={24} />
                            </div>
                            <h3 className="text-2xl font-bold text-white">ติดตั้งลงมือถือ</h3>
                        </div>

                        <div className="space-y-6">
                            {/* Instruction Cards Area */}
                            <div className="grid grid-cols-1 gap-4">
                                {/* iOS Instruction */}
                                <div className={`p-4 rounded-2xl border transition-all ${isIOS ? 'bg-purple-600/30 border-purple-400/50 scale-[1.02]' : 'bg-white/5 border-white/10'}`}>
                                    <h4 className="flex items-center gap-2 text-white font-bold mb-3">
                                        <span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs">A</span>
                                        สำหรับ iPhone (Safari)
                                    </h4>
                                    <ol className="space-y-3 text-sm text-slate-300">
                                        <li className="flex gap-2">
                                            <span className="text-purple-400 font-bold">1.</span>
                                            <span>กดปุ่ม <Share size={16} className="inline text-blue-400 mx-1" /> ด้านล่างของจอ</span>
                                        </li>
                                        <li className="flex gap-2">
                                            <span className="text-purple-400 font-bold">2.</span>
                                            <span>เลือก <span className="text-white font-medium">"Add to Home Screen"</span></span>
                                        </li>
                                    </ol>
                                </div>

                                {/* Android Instruction */}
                                <div className={`p-4 rounded-2xl border transition-all ${!isIOS ? 'bg-purple-600/30 border-purple-400/50 scale-[1.02]' : 'bg-white/5 border-white/10'}`}>
                                    <h4 className="flex items-center gap-2 text-white font-bold mb-3">
                                        <span className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-xs">B</span>
                                        สำหรับ Android (Chrome)
                                    </h4>
                                    <ol className="space-y-3 text-sm text-slate-300">
                                        <li className="flex gap-2">
                                            <span className="text-purple-400 font-bold">1.</span>
                                            <span>กดปุ่ม <span className="text-white font-bold text-lg leading-none">⋮</span> มุมขวาบน</span>
                                        </li>
                                        <li className="flex gap-2">
                                            <span className="text-purple-400 font-bold">2.</span>
                                            <span>เลือก <span className="text-white font-medium">"Install App"</span> หรือ <span className="text-white font-medium">"Add to Home Screen"</span></span>
                                        </li>
                                    </ol>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <p className="text-center text-slate-500 text-xs mt-6">
                * เมื่อติดตั้งแล้ว คุณจะสามารถเข้าถึงแอปได้จากหน้าจอโฮมโดยไม่ต้องใช้เบราว์เซอร์
            </p>
        </div>
    );
}
