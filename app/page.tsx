import Link from "next/link";

export default function HomePage() {
    return (
        <main className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
            <div className="container mx-auto px-4 py-16">
                <div className="text-center mb-10 md:mb-16">
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 animate-fade-in px-4">
                        🎨 Stamp Printing App
                    </h1>
                    <p className="text-lg md:text-xl text-purple-200 px-4">
                        สร้างแสตมป์สุดพิเศษด้วยรูปภาพของคุณ
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                        <div className="text-5xl mb-4">📸</div>
                        <h3 className="text-2xl font-bold text-white mb-3">อัพโหลดรูป</h3>
                        <p className="text-purple-200">
                            อัพโหลดรูปภาพของคุณ ปรับขนาด ครอป และซูมได้ตามต้องการ
                        </p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                        <div className="text-5xl mb-4">🎨</div>
                        <h3 className="text-2xl font-bold text-white mb-3">แต่งแสตมป์</h3>
                        <p className="text-purple-200">
                            เลือกพื้นหลัง ขนาด และรูปแบบแสตมป์ที่คุณชอบ
                        </p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                        <div className="text-5xl mb-4">🛒</div>
                        <h3 className="text-2xl font-bold text-white mb-3">สั่งซื้อ</h3>
                        <p className="text-purple-200">
                            เพิ่มลงตะกร้าและสั่งซื้อแสตมป์ที่คุณออกแบบ
                        </p>
                    </div>
                </div>

                <div className="text-center mt-16">
                    <Link href="/editor" className="inline-block bg-gradient-to-r from-pink-500 to-purple-600 text-white px-12 py-4 rounded-full text-xl font-bold hover:from-pink-600 hover:to-purple-700 transition-all duration-300 hover:scale-110 shadow-2xl">
                        เริ่มสร้างแสตมป์
                    </Link>
                </div>

                <div className="mt-8 text-center">
                    <Link href="/admin" className="text-slate-500 hover:text-slate-300 text-sm underline transition-colors">
                        Admin Dashboard
                    </Link>
                </div>
            </div>
        </main>
    );
}
