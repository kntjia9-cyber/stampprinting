"use client";

import { useState } from "react";
import { login } from "@/app/actions/auth";
import { Lock, Loader2 } from "lucide-react";

export default function LoginPage() {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError(null);
        const result = await login(formData);
        if (result?.error) {
            setError(result.error);
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="bg-slate-800 border border-white/10 rounded-2xl p-8 shadow-2xl">
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mb-4 border border-purple-500/20">
                            <Lock className="text-purple-400" size={32} />
                        </div>
                        <h1 className="text-2xl font-bold text-white">เข้าสู่ระบบ Admin</h1>
                        <p className="text-slate-400 mt-2 text-center text-sm">
                            กรุณาระบุรหัสผ่านเพื่อเข้าถึงระบบจัดการ
                        </p>
                    </div>

                    <form action={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">
                                รหัสผ่าน
                            </label>
                            <input
                                type="password"
                                name="password"
                                required
                                className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all placeholder:text-slate-600"
                                placeholder="••••••••"
                            />
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm text-center">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-purple-900/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                "เข้าสู่ระบบ"
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
