"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { User, LogOut, ShoppingCart, LayoutDashboard } from "lucide-react";

export function Navbar() {
    const { data: session } = useSession();

    return (
        <nav className="bg-black/30 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                <Link href="/" className="text-xl md:text-2xl font-bold text-white hover:text-purple-300 transition-colors">
                    🎨 StampApp
                </Link>

                <div className="flex items-center gap-4 md:gap-6">
                    <Link href="/cart" className="text-purple-200 hover:text-white transition-colors relative">
                        <ShoppingCart size={24} />
                    </Link>

                    {session ? (
                        <div className="flex items-center gap-4">
                            <Link href="/profile" className="flex items-center gap-2 text-slate-200 hover:text-white transition-colors">
                                <User size={20} className="text-purple-400" />
                                <span className="hidden md:inline font-medium">{session.user?.name || "สมาชิก"}</span>
                            </Link>
                            {(session.user as any)?.role === "ADMIN" && (
                                <Link href="/admin" className="text-yellow-400 hover:text-yellow-300 transition-colors">
                                    <LayoutDashboard size={20} />
                                </Link>
                            )}
                            <button
                                onClick={() => signOut()}
                                className="text-slate-400 hover:text-red-400 transition-colors"
                                title="ออกจากระบบ"
                            >
                                <LogOut size={20} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Link
                                href="/login"
                                className="text-purple-200 hover:text-white font-medium transition-colors"
                            >
                                เข้าสู่ระบบ
                            </Link>
                            <Link
                                href="/register"
                                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all"
                            >
                                สมัครสมาชิก
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
