"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerUser } from "@/app/actions/user";

export default function RegisterPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError("");

        const result = await registerUser(formData);

        if (result.error) {
            setError(result.error);
            setLoading(false);
        } else {
            router.push("/login?registered=true");
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl w-full max-w-md shadow-2xl">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">สมัครสมาชิก</h1>
                    <p className="text-purple-200">เพื่อเก็บประวัติและที่อยู่การจัดส่งของคุณ</p>
                </div>

                <form action={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-purple-200 mb-1">ชื่อ-นามสกุล</label>
                        <input
                            name="name"
                            type="text"
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-white/20"
                            placeholder="John Doe"
                        />
                    </div>

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

                    <div>
                        <label className="block text-sm font-medium text-purple-200 mb-1">รหัสผ่าน</label>
                        <input
                            name="password"
                            type="password"
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-white/20"
                            placeholder="••••••••"
                        />
                    </div>

                    {error && (
                        <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-lg text-sm text-center">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-pink-500/20 disabled:opacity-50"
                    >
                        {loading ? "กำลังบันทึก..." : "สมัครสมาชิก"}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-slate-400 text-sm">
                        มีสมาชิกอยู่แล้ว?{" "}
                        <Link href="/login" className="text-purple-400 hover:text-white font-bold underline transition-colors">
                            เข้าสู่ระบบ
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
