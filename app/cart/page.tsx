"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

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
    };
}

interface Order {
    id: number;
    total: number;
    status: string;
    createdAt: string;
    items: OrderItem[];
}

export default function CartPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const updateTimeouts = useRef<Record<string, any>>({});

    useEffect(() => {
        fetchOrders();
        // Cleanup timeouts on unmount
        const timeouts = updateTimeouts.current;
        return () => {
            Object.values(timeouts).forEach(clearTimeout);
        };
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await fetch("/api/orders");
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

    const updateQuantity = async (itemId: string, newQuantity: number) => {
        if (newQuantity < 1) return;

        // 1. Optimistic UI Update
        const updatedOrders = orders.map(order => {
            const itemToUpdate = order.items.find(item => item.id === itemId);
            if (itemToUpdate) {
                const quantityDiff = newQuantity - itemToUpdate.quantity;
                const priceDiff = itemToUpdate.price * quantityDiff;
                
                return {
                    ...order,
                    total: order.total + priceDiff,
                    items: order.items.map(item => 
                        item.id === itemId 
                            ? { ...item, quantity: newQuantity } 
                            : item
                    )
                };
            }
            return order;
        });
        
        setOrders(updatedOrders);

        // 2. Debounced API Call
        if (updateTimeouts.current[itemId]) {
            clearTimeout(updateTimeouts.current[itemId]);
        }

        updateTimeouts.current[itemId] = setTimeout(async () => {
            try {
                const response = await fetch(`/api/orders/items/${itemId}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ quantity: newQuantity })
                });

                const result = await response.json();

                if (!result.success) {
                    console.error("Failed to update quantity on server:", result.error);
                    // On error, we might want to refresh to get the correct state
                    fetchOrders();
                }
            } catch (error) {
                console.error("Error updating quantity:", error);
                fetchOrders();
            } finally {
                delete updateTimeouts.current[itemId];
            }
        }, 500); // 500ms debounce
    };

    const deleteItem = async (itemId: string) => {
        if (!confirm("คุณต้องการลบรายการนี้ใช่หรือไม่?")) {
            return;
        }

        try {
            const response = await fetch(`/api/orders/items/${itemId}`, {
                method: "DELETE"
            });

            const result = await response.json();

            if (result.success) {
                // Refresh orders
                await fetchOrders();
                alert(result.message || "ลบรายการเรียบร้อยแล้ว");
            } else {
                alert("เกิดข้อผิดพลาด: " + result.error);
            }
        } catch (error) {
            console.error("Error deleting item:", error);
            alert("ไม่สามารถลบรายการได้");
        }
    };

    const getTotalItems = () => {
        return orders.reduce((total, order) => {
            return total + order.items.reduce((sum, item) => sum + item.quantity, 0);
        }, 0);
    };

    const getGrandTotal = () => {
        return orders.reduce((total, order) => total + order.total, 0);
    };

    const getStatusBadge = (status: string) => {
        const statusColors: { [key: string]: string } = {
            PENDING: "bg-yellow-500",
            PAID: "bg-green-500",
            SHIPPED: "bg-blue-500",
            COMPLETED: "bg-purple-500"
        };

        const statusText: { [key: string]: string } = {
            PENDING: "รอชำระเงิน",
            PAID: "ชำระแล้ว",
            SHIPPED: "จัดส่งแล้ว",
            COMPLETED: "เสร็จสิ้น"
        };

        return (
            <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${statusColors[status] || "bg-gray-500"}`}>
                {statusText[status] || status}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                <div className="text-white text-2xl">กำลังโหลด...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Header */}
            <header className="bg-black/30 backdrop-blur-md border-b border-white/10">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <Link href="/" className="text-2xl font-bold text-white hover:text-purple-300 transition-colors">
                        🎨 Stamp Printing App
                    </Link>
                    <div className="flex gap-4">
                        <Link
                            href="/editor"
                            className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
                        >
                            กลับไปแก้ไข
                        </Link>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 text-center md:text-left">🛒 ตะกร้าสินค้า</h1>
                    <p className="text-purple-200 text-center md:text-left">
                        {getTotalItems()} รายการ • ยอดรวม {getGrandTotal().toFixed(2)} บาท
                    </p>
                </div>

                {orders.length === 0 ? (
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 border border-white/20 text-center">
                        <div className="text-6xl mb-4">🛒</div>
                        <h2 className="text-2xl font-bold text-white mb-2">ตะกร้าว่างเปล่า</h2>
                        <p className="text-purple-200 mb-6">ยังไม่มีสินค้าในตะกร้า</p>
                        <Link
                            href="/editor"
                            className="inline-block px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-lg font-bold transition-all"
                        >
                            เริ่มสร้างแสตมป์
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div
                                key={order.id}
                                className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-white mb-1">
                                            คำสั่งซื้อ #{order.id}
                                        </h3>
                                        <p className="text-sm text-purple-200">
                                            {new Date(order.createdAt).toLocaleDateString("th-TH", {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit"
                                            })}
                                        </p>
                                    </div>
                                    {getStatusBadge(order.status)}
                                </div>

                                <div className="space-y-4">
                                    {order.items.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex flex-col sm:flex-row gap-4 bg-white/5 rounded-xl p-4 border border-white/10"
                                        >
                                            {/* Preview Images */}
                                            <div className="flex-shrink-0 flex gap-2 justify-center sm:justify-start">
                                                {/* Custom Image (รูปคน) */}
                                                <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-lg overflow-hidden border-2 border-purple-300">
                                                    {item.customImageUrl ? (
                                                        <img
                                                            src={item.customImageUrl}
                                                            alt="Stamp preview"
                                                            className="w-full h-full object-contain"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                            No Image
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Background Image */}
                                                <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-lg overflow-hidden border-2 border-blue-300">
                                                    {item.previewUrl ? (
                                                        <img
                                                            src={item.previewUrl}
                                                            alt="Background preview"
                                                            className="w-full h-full object-contain"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                                            No BG
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Item Details */}
                                            <div className="flex-grow text-center sm:text-left">
                                                <h4 className="text-white font-bold mb-1">
                                                    {item.template.name}
                                                </h4>
                                                <p className="text-sm text-purple-200 mb-2">
                                                    ขนาด: {item.template.width} × {item.template.height} cm
                                                </p>

                                                {/* Quantity Controls */}
                                                <div className="flex items-center justify-center sm:justify-start gap-4 text-sm mb-2">
                                                    <span className="text-purple-200">จำนวน:</span>
                                                    <div className="flex items-center gap-2 bg-white/10 rounded-lg p-1">
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                            className="w-8 h-8 flex items-center justify-center bg-purple-500 hover:bg-purple-600 text-white rounded font-bold transition-all"
                                                        >
                                                            −
                                                        </button>
                                                        <span className="text-white font-bold w-12 text-center">
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                            className="w-8 h-8 flex items-center justify-center bg-purple-500 hover:bg-purple-600 text-white rounded font-bold transition-all"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-center sm:justify-start gap-4">
                                                    <span className="text-white font-bold">
                                                        {item.price.toFixed(2)} บาท/ชิ้น
                                                    </span>
                                                    <button
                                                        onClick={() => deleteItem(item.id)}
                                                        className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded-lg transition-all"
                                                    >
                                                        🗑️ ลบ
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Subtotal */}
                                            <div className="flex-shrink-0 text-center sm:text-right pt-4 sm:pt-0 border-t sm:border-t-0 border-white/10">
                                                <p className="text-sm text-purple-200 mb-1">รวม</p>
                                                <p className="text-2xl sm:text-xl font-bold text-white">
                                                    {(item.price * item.quantity).toFixed(2)} ฿
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Order Total */}
                                <div className="mt-4 pt-4 border-t border-white/20 flex justify-between items-center">
                                    <span className="text-lg font-bold text-white">ยอดรวมคำสั่งซื้อ</span>
                                    <span className="text-2xl font-bold text-white">
                                        {order.total.toFixed(2)} ฿
                                    </span>
                                </div>
                            </div>
                        ))}

                        {/* Grand Total */}
                        <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl p-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-white/80 mb-1">ยอดรวมทั้งหมด</p>
                                    <p className="text-3xl font-bold text-white">
                                        {getGrandTotal().toFixed(2)} บาท
                                    </p>
                                </div>
                                <Link
                                    href="/checkout"
                                    className="px-8 py-4 bg-white text-purple-600 rounded-xl font-bold text-lg hover:bg-purple-50 transition-all shadow-xl inline-block"
                                >
                                    ชำระเงิน
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
