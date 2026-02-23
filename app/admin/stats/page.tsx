"use client";

import { useState, useEffect } from "react";
import { Users, Activity, Calendar, RefreshCcw } from "lucide-react";

interface Stats {
    onlineNow: number;
    dailyTotal: number;
    date: string;
}

export default function VisitorStatsPage() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    const fetchStats = async (date?: string) => {
        setLoading(true);
        try {
            const url = date
                ? `/api/admin/stats/visits?date=${date}`
                : "/api/admin/stats/visits";
            const response = await fetch(url);
            const data = await response.json();
            if (data.success) {
                setStats(data.stats);
            }
        } catch (error) {
            console.error("Error fetching stats:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats(selectedDate);
    }, [selectedDate]);

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Activity className="text-purple-400" />
                        สถิติผู้เข้าชมตลาดภาพ (Visitor Stats)
                    </h1>
                    <p className="text-slate-400 mt-1">ติดตามข้อมูลคนออนไลน์และยอดการเข้าชมรายวัน</p>
                </div>
                <button
                    onClick={() => fetchStats(selectedDate)}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold transition-all disabled:opacity-50"
                >
                    <RefreshCcw size={18} className={loading ? "animate-spin" : ""} />
                    อัปเดตข้อมูล (Refresh)
                </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Online Now Card */}
                <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-white/10 rounded-2xl p-6 backdrop-blur-xl group">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-purple-500/20 rounded-xl">
                            <Users className="text-purple-400" size={24} />
                        </div>
                        <span className="flex h-3 w-3 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                    </div>
                    <h3 className="text-slate-400 font-medium">ออนไลน์ตอนนี้ (ใน 5 นาที)</h3>
                    <p className="text-4xl font-black text-white mt-2">
                        {loading ? "..." : stats?.onlineNow || 0} <span className="text-lg font-normal text-slate-500">คน</span>
                    </p>
                </div>

                {/* Daily Total Card */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-blue-500/20 rounded-xl">
                            <Calendar className="text-blue-400" size={24} />
                        </div>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="bg-black/20 border border-white/10 rounded-lg px-3 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                        />
                    </div>
                    <h3 className="text-slate-400 font-medium">ยอดผู้เข้าชมรวมของวันที่เลือก</h3>
                    <p className="text-4xl font-black text-white mt-2">
                        {loading ? "..." : stats?.dailyTotal || 0} <span className="text-lg font-normal text-slate-500">คน (Unique)</span>
                    </p>
                </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
                <p className="text-slate-500 italic">
                    * หมายเหตุ: ระบบนี้นับจำนวนผู้เข้าชมที่ไม่ซ้ำคน (Unique Visitors) โดยใช้ Browser Session ID
                </p>
            </div>
        </div>
    );
}
