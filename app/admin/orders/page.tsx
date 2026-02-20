"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { StampComposite } from "@/components/StampComposite";
import { PrintStyles } from "@/components/PrintStyles";

interface OrderItem {
    id: string;
    quantity: number;
    price: number;
    customImageUrl: string;
    previewUrl: string;
    template: {
        id: string;
        name: string;
        width: number;
        height: number;
        backgroundUrl: string;
        backgroundWidth: number;
        backgroundHeight: number;
        backgroundX: number;
        backgroundY: number;
        userImageWidth: number;
        userImageHeight: number;
        userImageX: number;
        userImageY: number;
        userImagePrintX: number | null;
        userImagePrintY: number | null;
        userImageColumns: number;
        userImageRows: number;
        userImageColumnSpacing: number;
        userImageRowSpacing: number;
        userImagePreviewColumnSpacing: number;
        userImagePreviewRowSpacing: number;
        realStampSampleUrl: string | null;
        realStampX: number | null;
        realStampY: number | null;
        whiteBorderWidth: number | null;
        whiteBorderHeight: number | null;
        whiteBorderX: number | null;
        whiteBorderY: number | null;
    };
}

interface Order {
    id: number;
    total: number;
    status: string;
    customerName: string;
    customerAddress: string;
    customerPhone: string;
    customerEmail: string;
    paymentProofUrl: string;
    createdAt: string;
    items: OrderItem[];
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [printingItem, setPrintingItem] = useState<OrderItem | null>(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await fetch("/api/admin/orders");
            const data = await response.json();
            if (data.success) {
                setOrders(data.orders);
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (orderId: number, currentStatus: string) => {
        const newStatus = currentStatus === "COMPLETED" ? "PAID" : "COMPLETED";
        const statusLabel = newStatus === "COMPLETED" ? "พิมพ์แล้ว" : "ยังไม่พิมพ์";

        if (!confirm(`ต้องการเปลี่ยนสถานะเป็น '${statusLabel}' ใช่หรือไม่?`)) return;

        try {
            const response = await fetch(`/api/admin/orders/${orderId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus })
            });

            const data = await response.json();
            if (data.success) {
                fetchOrders();
            } else {
                alert("เกิดข้อผิดพลาด: " + data.error);
            }
        } catch (error) {
            console.error("Error updating status:", error);
            alert("ไม่สามารถอัพเดทสถานะได้");
        }
    };

    const handlePrint = (item: OrderItem) => {
        setPrintingItem(item);
        // Wait for state to update and portal to render
        setTimeout(() => {
            window.print();
        }, 100);
    };

    if (loading) {
        return <div className="text-white p-8">Loading orders...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">📦 Orders Management</h1>
                <button onClick={fetchOrders} className="text-sm text-purple-300 hover:text-white transition-colors">🔄 รีเฟรช</button>
            </div>

            {orders.length === 0 ? (
                <div className="bg-white/10 border border-white/10 rounded-xl p-12 text-center text-slate-400">
                    <p className="text-xl">No orders yet.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {orders.map((order) => (
                        <div key={order.id} className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all cursor-pointer relative" onClick={() => setSelectedOrder(order)}>
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-xl font-bold text-white">Order #{order.id}</h3>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleToggleStatus(order.id, order.status); }}
                                            className={`px-3 py-1 rounded-full text-xs font-bold text-white transition-all shadow-md ${order.status === "COMPLETED" ? "bg-purple-600 hover:bg-purple-700" : "bg-blue-600 hover:bg-blue-700"
                                                }`}
                                        >
                                            {order.status === "COMPLETED" ? "✅ พิมพ์แล้ว" : "⏳ ยังไม่พิมพ์"}
                                        </button>
                                    </div>
                                    <p className="text-slate-400 text-sm mt-1">{new Date(order.createdAt).toLocaleString("th-TH")}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-white">{order.total.toFixed(2)} ฿</p>
                                    <p className="text-slate-500 text-xs font-medium uppercase tracking-tighter">Customer: {order.customerName}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="flex flex-wrap items-center justify-between bg-black/20 p-4 rounded-xl border border-white/5 gap-4">
                                        <div className="flex items-center gap-4">
                                            {/* Side by side images */}
                                            <div className="flex gap-2">
                                                <div className="relative w-20 h-20 rounded-lg border-2 border-purple-500/30 overflow-hidden bg-white shadow-lg" title="รูปที่อัพโหลด">
                                                    <img src={item.customImageUrl} alt="user" className="w-full h-full object-contain" />
                                                    <span className="absolute bottom-0 right-0 bg-purple-500 text-[8px] text-white px-1 font-bold">USER</span>
                                                </div>
                                                <div className="relative w-20 h-20 rounded-lg border-2 border-blue-500/30 overflow-hidden bg-white shadow-lg" title="แบ็คกราวด์ที่เลือก">
                                                    <img src={item.previewUrl} alt="bg" className="w-full h-full object-contain" />
                                                    <span className="absolute bottom-0 right-0 bg-blue-500 text-[8px] text-white px-1 font-bold">BG</span>
                                                </div>
                                            </div>

                                            <div>
                                                <p className="text-white font-bold leading-tight">{item.template.name}</p>
                                                <p className="text-slate-400 text-xs mt-1">{item.quantity} ชิ้น @ {item.price} ฿</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handlePrint(item); }}
                                                className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold shadow-lg transition-all transform hover:scale-105 active:scale-95"
                                            >
                                                <span className="text-xl">🖨️</span>
                                                <span>พิมพ์รายการนี้</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 flex justify-between items-center text-xs text-slate-500">
                                <span>📞 {order.customerPhone}</span>
                                <span className="line-clamp-1 max-w-[50%]">📍 {order.customerAddress}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal for Order Details */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedOrder(null)}>
                    <div className="bg-slate-900 border border-white/20 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-white/10 flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-white">Order Details #{selectedOrder.id}</h2>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleToggleStatus(selectedOrder.id, selectedOrder.status)}
                                    className={`px-4 py-2 rounded-lg font-bold transition-all text-white ${selectedOrder.status === "COMPLETED" ? "bg-purple-600 hover:bg-purple-700" : "bg-blue-600 hover:bg-blue-700"
                                        }`}
                                >
                                    {selectedOrder.status === "COMPLETED" ? "✅ พิมพ์แล้ว" : "⏳ ยังไม่พิมพ์"}
                                </button>
                                <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-white text-2xl">&times;</button>
                            </div>
                        </div>

                        <div className="p-6 grid md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-purple-400 font-bold mb-2 uppercase text-xs tracking-wider">Customer Information</h4>
                                    <div className="bg-white/5 rounded-xl p-4 space-y-2 text-white">
                                        <p><span className="text-slate-400">Name:</span> {selectedOrder.customerName}</p>
                                        <p><span className="text-slate-400">Email:</span> {selectedOrder.customerEmail}</p>
                                        <p><span className="text-slate-400">Phone:</span> {selectedOrder.customerPhone}</p>
                                        <p><span className="text-slate-400">Address:</span> {selectedOrder.customerAddress}</p>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-purple-400 font-bold mb-2 uppercase text-xs tracking-wider">Order Items</h4>
                                    <div className="space-y-3">
                                        {selectedOrder.items.map((item) => (
                                            <div key={item.id} className="bg-white/5 rounded-xl p-3 flex gap-4 items-center">
                                                <div className="w-16 h-16 bg-white rounded-lg overflow-hidden shrink-0">
                                                    <img src={item.customImageUrl} alt="item" className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-grow">
                                                    <p className="text-white font-bold">{item.template.name}</p>
                                                    <p className="text-slate-400 text-sm">{item.quantity} x {item.price.toFixed(2)} ฿</p>
                                                </div>
                                                <div className="flex flex-col items-end gap-2 text-right">
                                                    <div className="text-white font-bold">
                                                        {(item.quantity * item.price).toFixed(2)} ฿
                                                    </div>
                                                    <button
                                                        onClick={() => handlePrint(item)}
                                                        className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-lg transition-all"
                                                    >
                                                        🖨️ พิมพ์
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-purple-400 font-bold mb-2 uppercase text-xs tracking-wider">Payment Proof</h4>
                                {selectedOrder.paymentProofUrl ? (
                                    <div className="bg-white/5 rounded-xl p-2">
                                        <img src={selectedOrder.paymentProofUrl} alt="Payment Proof" className="w-full rounded-lg" />
                                        <a href={selectedOrder.paymentProofUrl} target="_blank" className="block text-center mt-3 text-purple-400 hover:text-purple-300 font-bold transition-all">View Full Size</a>
                                    </div>
                                ) : (
                                    <div className="bg-white/5 rounded-xl p-8 text-center text-slate-500 italic">No payment proof uploaded</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Hidden Print Area */}
            {printingItem && (
                <>
                    <PrintStyles
                        backgroundWidth={printingItem.template.backgroundWidth}
                        backgroundHeight={printingItem.template.backgroundHeight}
                    />
                    {typeof document !== 'undefined' && createPortal(
                        <div id="print-root" className="hidden print:block">
                            <div id="print-area">
                                <StampComposite
                                    template={printingItem.template}
                                    backgroundUrl={printingItem.previewUrl}
                                    uploadedImage={printingItem.customImageUrl}
                                    scale={50}
                                    isPrint={true}
                                    hideRealStamp={true}
                                />
                            </div>
                        </div>,
                        document.body
                    )}
                </>
            )}
        </div>
    );
}
