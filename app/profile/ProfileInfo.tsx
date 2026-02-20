"use client";

import { useState } from "react";
import { User, UserCircle, Phone, MapPin, Edit2, X, Check, Loader2 } from "lucide-react";
import { updateUserInfo } from "@/app/actions/user";

interface ProfileInfoProps {
    user: {
        id: string;
        name: string | null;
        email: string | null;
        phone: string | null;
        address: string | null;
    };
}

export default function ProfileInfo({ user }: ProfileInfoProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: user.name || "",
        phone: user.phone || "",
        address: user.address || "",
    });

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await updateUserInfo(user.id, formData);
            setIsEditing(false);
            window.location.reload(); // Refresh to update session/server data
        } catch (error) {
            alert("เกิดข้อผิดพลาดในการอัปเดตข้อมูล");
        } finally {
            setLoading(false);
        }
    };

    if (isEditing) {
        return (
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl animate-in fade-in zoom-in duration-300">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Edit2 size={20} className="text-purple-400" />
                        แก้ไขข้อมูลส่วนตัว
                    </h3>
                    <button
                        onClick={() => setIsEditing(false)}
                        className="text-slate-400 hover:text-white transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleUpdate} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-purple-200 mb-2 flex items-center gap-2">
                            <User size={14} /> ชื่อ-นามสกุล
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                            placeholder="ระบุชื่อ-นามสกุล"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-purple-200 mb-2 flex items-center gap-2">
                            <Phone size={14} /> เบอร์โทรศัพท์
                        </label>
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                            placeholder="ระบุเบอร์โทรศัพท์"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-purple-200 mb-2 flex items-center gap-2">
                            <MapPin size={14} /> ที่อยู่จัดส่ง
                        </label>
                        <textarea
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all h-24 resize-none"
                            placeholder="ระบุที่อยู่จัดส่งโดยละเอียด"
                        />
                    </div>

                    <div className="pt-2 flex gap-3">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-grow bg-gradient-to-r from-purple-500 to-blue-600 text-white font-bold py-3 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-900/20"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />}
                            บันทึกข้อมูล
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsEditing(false)}
                            className="px-6 bg-white/5 text-white font-bold py-3 rounded-xl hover:bg-white/10 transition-all border border-white/10"
                        >
                            ยกเลิก
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-xl overflow-hidden relative group">
            {/* Background Decoration */}
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all duration-700"></div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-900/30">
                        <UserCircle size={48} className="text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-1">{user.name || "ยังไม่ได้ระบุชื่อ"}</h2>
                        <p className="text-purple-300 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500"></span>{user.email}</p>
                    </div>
                </div>

                <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-xl border border-white/10 transition-all hover:scale-105 active:scale-95 font-medium"
                >
                    <Edit2 size={18} />
                    แก้ไขโปรไฟล์
                </button>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mt-10">
                <div className="bg-black/20 p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
                    <p className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Phone size={12} /> เบอร์โทรศัพท์
                    </p>
                    <p className="text-lg text-white font-medium">{user.phone || <span className="text-slate-500 italic font-normal">ยังไม่ได้ระบุเบอร์โทรศัพท์</span>}</p>
                </div>
                <div className="bg-black/20 p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
                    <p className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <MapPin size={12} /> ที่อยู่จัดส่ง
                    </p>
                    <p className="text-white font-medium leading-relaxed">{user.address || <span className="text-slate-500 italic font-normal">ยังไม่ได้ระบุที่อยู่จัดส่ง</span>}</p>
                </div>
            </div>
        </div>
    );
}
