"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Stamp, ShoppingBag, Settings, LogOut } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    const linkClass = (path: string) => `
        flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
        ${isActive(path)
            ? "bg-purple-600/20 text-purple-400 border border-purple-500/20 shadow-lg shadow-purple-900/10"
            : "text-slate-400 hover:bg-white/5 hover:text-white"}
    `;

    return (
        <div className="min-h-screen bg-slate-900 flex font-sans selection:bg-purple-500/30 selection:text-purple-200">
            {/* Sidebar */}
            <aside className="w-64 shrink-0 bg-slate-800/50 backdrop-blur-xl border-r border-white/5 flex flex-col">
                <div className="p-6 border-b border-white/5">
                    <Link href="/" className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent flex items-center gap-2">
                        🚀 Admin Panel
                    </Link>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <Link href="/admin/dashboard" className={linkClass("/admin/dashboard")}>
                        <LayoutDashboard size={20} className={isActive("/admin/dashboard") ? "animate-pulse" : ""} />
                        Dashboard
                    </Link>
                    <Link href="/admin/templates" className={linkClass("/admin/templates")}>
                        <Stamp size={20} className={isActive("/admin/templates") ? "animate-pulse" : ""} />
                        Stamp Templates
                    </Link>
                    <Link href="/admin/orders" className={linkClass("/admin/orders")}>
                        <ShoppingBag size={20} className={isActive("/admin/orders") ? "animate-pulse" : ""} />
                        Orders
                    </Link>
                    <Link href="/admin/settings" className={linkClass("/admin/settings")}>
                        <Settings size={20} className={isActive("/admin/settings") ? "animate-pulse" : ""} />
                        Settings
                    </Link>
                </nav>

                <div className="p-4 border-t border-white/10">
                    <button className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 w-full rounded-lg transition-colors">
                        <LogOut size={20} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-auto">
                {children}
            </main>
        </div>
    );
}
