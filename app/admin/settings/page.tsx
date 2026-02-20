"use client";

import { useState, useEffect } from "react";
import { Save, Loader2, Building2, User, CreditCard, QrCode, Lock, Mail, Key } from "lucide-react";
import { getSettings, updateSettings } from "@/app/actions/settings";
import { useSession } from "next-auth/react";
import { updateAdminPassword } from "@/app/actions/user";

export default function SettingsPage() {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);
    const [settings, setSettings] = useState({
        bankName: "",
        accountName: "",
        accountNumber: "",
        promptPayId: ""
    });
    const [newPassword, setNewPassword] = useState("");
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        const result = await getSettings();
        if (result.success && result.settings) {
            setSettings({
                bankName: result.settings.bankName,
                accountName: result.settings.accountName,
                accountNumber: result.settings.accountNumber,
                promptPayId: result.settings.promptPayId
            });
        }
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        const result = await updateSettings(settings);

        if (result.success) {
            setMessage({ type: "success", text: "บันทึกการตั้งค่าเรียบร้อยแล้ว" });
        } else {
            const errorText = result.details
                ? `เกิดข้อผิดพลาด: ${result.details}`
                : "เกิดข้อผิดพลาดในการบันทึกข้อมูล";
            setMessage({ type: "error", text: errorText });
        }
        setSaving(false);
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!session?.user?.id) {
            setPasswordMessage({ type: "error", text: "กรุณาเข้าสู่ระบบก่อน" });
            return;
        }
        if (!newPassword || newPassword.length < 6) {
            setPasswordMessage({ type: "error", text: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" });
            return;
        }

        setSavingPassword(true);
        setPasswordMessage(null);
        const result = await updateAdminPassword(session.user.id, newPassword);
        if (result.success) {
            setPasswordMessage({ type: "success", text: "ปรับปรุงรหัสผ่านเรียบร้อยแล้ว" });
            setNewPassword("");
        } else {
            setPasswordMessage({ type: "error", text: "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน" });
        }
        setSavingPassword(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">⚙️ settings</h1>
                <p className="text-slate-400">ตั้งค่าข้อมูลระบบ บัญชีพื้นฐาน และ PromptPay</p>
            </div>

            {message && (
                <div className={`mb-6 p-4 rounded-xl border ${message.type === "success"
                    ? "bg-green-500/10 border-green-500/50 text-green-400"
                    : "bg-red-500/10 border-red-500/50 text-red-400"
                    }`}>
                    {message.text}
                </div>
            )}

            <div className="space-y-6">
                {/* Admin Profile Section */}
                <div className="bg-slate-800 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                    <div className="p-6 border-b border-white/10 bg-white/5">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Lock className="text-pink-400" size={20} />
                            ข้อมูลการเข้าสู่ระบบผู้ดูแลระบบ (Admin)
                        </h2>
                    </div>
                    <div className="p-6">
                        <div className="grid md:grid-cols-2 gap-8 items-start">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1.5 flex items-center gap-2">
                                        <Mail size={14} /> อีเมลล็อกอินหลัก
                                    </label>
                                    <div className="w-full bg-slate-900/50 border border-white/5 rounded-lg px-4 py-2.5 text-slate-300 font-mono">
                                        {session?.user?.email || "admin@admin.com"}
                                    </div>
                                    <p className="mt-1 text-[10px] text-slate-500">* อีเมลนี้ใช้สำหรับการล็อกอินเข้าหลังบ้าน</p>
                                </div>
                            </div>

                            <form onSubmit={handlePasswordSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1.5 flex items-center gap-2">
                                        <Key size={14} /> เปลี่ยนรหัสผ่านใหม่
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="flex-grow bg-slate-900 border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all placeholder:text-slate-600"
                                            placeholder="กรอกรหัสผ่านใหม่..."
                                        />
                                        <button
                                            type="submit"
                                            disabled={savingPassword}
                                            className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg font-bold text-sm transition-all disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {savingPassword ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                            เปลี่ยน
                                        </button>
                                    </div>
                                    {passwordMessage && (
                                        <p className={`mt-2 text-xs ${passwordMessage.type === "success" ? "text-green-400" : "text-red-400"}`}>
                                            {passwordMessage.text}
                                        </p>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-slate-800 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                        <div className="p-6 border-b border-white/10 bg-white/5">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Building2 className="text-purple-400" size={20} />
                                ข้อมูลบัญชีธนาคาร
                            </h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1.5 flex items-center gap-2">
                                        <Building2 size={14} /> ชื่อธนาคาร
                                    </label>
                                    <input
                                        type="text"
                                        value={settings.bankName}
                                        onChange={(e) => setSettings({ ...settings, bankName: e.target.value })}
                                        className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                                        placeholder="เช่น ธนาคารกสิกรไทย"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1.5 flex items-center gap-2">
                                        <User size={14} /> ชื่อบัญชี
                                    </label>
                                    <input
                                        type="text"
                                        value={settings.accountName}
                                        onChange={(e) => setSettings({ ...settings, accountName: e.target.value })}
                                        className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                                        placeholder="ชื่อ-นามสกุล หรือ ชื่อบริษัท"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1.5 flex items-center gap-2">
                                    <CreditCard size={14} /> เลขที่บัญชี
                                </label>
                                <input
                                    type="text"
                                    value={settings.accountNumber}
                                    onChange={(e) => setSettings({ ...settings, accountNumber: e.target.value })}
                                    className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-2.5 text-white font-mono tracking-wider focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                                    placeholder="xxx-x-xxxxx-x"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-800 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                        <div className="p-6 border-b border-white/10 bg-white/5">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <QrCode className="text-blue-400" size={20} />
                                PromptPay QR Code
                            </h2>
                        </div>
                        <div className="p-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1.5">
                                    หมายเลข PromptPay (เบอร์โทรศัพท์ หรือ เลขบัตรประชาชน)
                                </label>
                                <input
                                    type="text"
                                    value={settings.promptPayId}
                                    onChange={(e) => setSettings({ ...settings, promptPayId: e.target.value })}
                                    className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-2.5 text-white font-mono tracking-widest focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    placeholder="0xxxxxxxxxx"
                                    required
                                />
                                <p className="mt-2 text-xs text-slate-500">
                                    * ระบบจะนำหมายเลขนี้ไปสร้าง QR Code ให้ลูกค้าแสกนชำระเงินในหน้า Checkout อัตโนมัติ
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-bold shadow-lg shadow-purple-900/20 transition-all disabled:opacity-50"
                        >
                            {saving ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Save size={20} />
                            )}
                            บันทึกการตั้งค่า
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
