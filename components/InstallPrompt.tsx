"use client";

import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Share, Download, X, Smartphone, ArrowBigDown } from "lucide-react";

export default function InstallPrompt() {
    const [showPrompt, setShowPrompt] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [currentUrl, setCurrentUrl] = useState("");

    useEffect(() => {
        // Set URL for QR Code
        setCurrentUrl(window.location.origin);

        // Check platform
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIphone = /iphone|ipad|ipod/.test(userAgent);
        setIsIOS(isIphone);

        // Show prompt if not already in standalone mode
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches
            || (window.navigator as any).standalone
            || document.referrer.includes('android-app://');

        if (!isStandalone) {
            // Show after 2 seconds
            const timer = setTimeout(() => setShowPrompt(true), 2000);
            return () => clearTimeout(timer);
        }
    }, []);

    if (!showPrompt) return null;

    return (
        <div className="fixed inset-x-0 bottom-0 z-50 p-4 animate-in fade-in slide-in-from-bottom-10 duration-500">
            <div className="max-w-md mx-auto bg-slate-800/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-6 relative overflow-hidden">
                <button
                    onClick={() => setShowPrompt(false)}
                    className="absolute top-3 right-3 text-slate-400 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="flex gap-4 items-start">
                    <div className="bg-purple-600/20 p-3 rounded-xl border border-purple-500/20">
                        <Smartphone className="text-purple-400" size={24} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-white font-bold text-lg mb-1">ติดตั้งแอปเพื่อความสะดวก</h3>
                        <p className="text-slate-400 text-sm leading-relaxed mb-4">
                            เพิ่มแอป Stamp Printing ลงบนหน้าจอโฮมของคุณ เพื่อให้คุณสามารถสร้างแสตมป์ได้รวดเร็วทุกเวลา
                        </p>

                        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                            <h4 className="text-purple-300 text-xs font-bold uppercase tracking-wider mb-2">วิธีติดตั้ง:</h4>
                            {isIOS ? (
                                <div className="space-y-2 text-slate-300 text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="bg-white/10 w-6 h-6 rounded flex items-center justify-center text-xs">1</div>
                                        <span>กดปุ่ม <Share size={16} className="inline text-blue-400 mx-1" /> ด้านล่างของ Safari</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="bg-white/10 w-6 h-6 rounded flex items-center justify-center text-xs">2</div>
                                        <span>เลื่อนลงมาแล้วเลือก <span className="text-white font-medium">"Add to Home Screen"</span></span>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-2 text-slate-300 text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="bg-white/10 w-6 h-6 rounded flex items-center justify-center text-xs">1</div>
                                        <span>กดปุ่ม <span className="text-white font-bold text-lg leading-none">⋮</span> มุมขวาบนของเบราว์เซอร์</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="bg-white/10 w-6 h-6 rounded flex items-center justify-center text-xs">2</div>
                                        <span>เลือก <span className="text-white font-medium">"Install App"</span> หรือ <span className="text-white font-medium">"Add to Home Screen"</span></span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Optional QR Code Section for desktop users */}
                <div className="hidden md:flex mt-6 pt-6 border-t border-white/5 flex-col items-center">
                    <p className="text-white text-sm font-bold mb-3">สแกนเพื่อเปิดบนมือถือ</p>
                    <div className="bg-white p-2 rounded-xl">
                        <QRCodeSVG value={currentUrl} size={120} />
                    </div>
                </div>

                <div className="mt-4 flex justify-between items-center text-[10px] text-slate-500">
                    <span>แอปขนาดเล็ก ไม่เปลืองพื้นที่เครื่อง</span>
                    <ArrowBigDown size={14} className="animate-bounce" />
                </div>
            </div>
        </div>
    );
}
