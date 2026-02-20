"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, getSession } from "next-auth/react";

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [registered, setRegistered] = useState(false);

    useEffect(() => {
        if (searchParams.get("registered")) {
            setRegistered(true);
        }
        if (searchParams.get("error")) {
            setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
        }
    }, [searchParams]);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
                setLoading(false);
            } else {
                // Successful login - get session to check role
                const session = await getSession();

                if ((session?.user as any)?.role === "ADMIN") {
                    router.push("/admin/orders");
                } else {
                    router.push("/");
                }
                router.refresh();
            }
        } catch (err) {
            setError("เกิดข้อผิดพลาดในการเชื่อมต่อ");
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl w-full max-w-md shadow-2xl">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">เข้าสู่ระบบ</h1>
                    <p className="text-purple-200">ยินดีต้อนรับกลับเข้าสู่ระบบ</p>
                </div>

                {registered && (
                    <div className="bg-green-500/20 border border-green-500/50 text-green-200 p-3 rounded-lg text-sm text-center mb-4">
                        สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-purple-200 mb-1">อีเมล</label>
                        <input
                            name="email"
                            type="email"
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-white/20"
                            placeholder="example@email.com"
                        />
                    </div>

                    <div className="relative">
                        <label className="block text-sm font-medium text-purple-200 mb-1">รหัสผ่าน</label>
                        <input
                            name="password"
                            type="password"
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-white/20"
                            placeholder="••••••••"
                        />
                        <div className="flex justify-end mt-1">
                            <button
                                type="button"
                                onClick={() => alert("กรุณาติดต่อผู้ดูแลระบบเพื่อรีเซ็ตรหัสผ่าน\nLine: @stampprinting")}
                                className="text-xs text-purple-400 hover:text-white transition-colors"
                            >
                                ลืมรหัสผ่าน?
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-lg text-sm text-center">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
                    >
                        {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-slate-400 text-sm">
                        ยังไม่เป็นสมาชิก?{" "}
                        <Link href="/register" className="text-pink-400 hover:text-white font-bold underline transition-colors">
                            สมัครสมาชิกใหม่
                        </Link>
                    </p>
                    <div className="mt-4">
                        <Link href="/" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
                            กลับหน้าแรก
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="text-white animate-pulse">กำลังโหลด...</div>
            </div>
        }>
            <LoginForm />
        </Suspense>
    );
}
