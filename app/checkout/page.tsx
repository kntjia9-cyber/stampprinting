"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { QRCodeCanvas } from "qrcode.react";
import generatePayload from "promptpay-qr";

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

import { useSession } from "next-auth/react";
import { getUser, updateUserInfo } from "@/app/actions/user";

export default function CheckoutPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [paymentProof, setPaymentProof] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>("");
    const [globalSettings, setGlobalSettings] = useState<any>(null);

    useEffect(() => {
        fetchOrders();
        loadGlobalSettings();
    }, []);

    // Load user info when session is available
    useEffect(() => {
        if (session?.user?.id && session.user.id !== "guest-user") {
            const loadUserInfo = async () => {
                const userData = await getUser(session.user!.id!) as any;
                if (userData) {
                    setName(userData.name || "");
                    setEmail(userData.email || "");
                    setPhone(userData.phone || "");
                    setAddress(userData.address || "");
                }
            };
            loadUserInfo();
        }
    }, [session]);

    const loadGlobalSettings = async () => {
        const result = await (await import("@/app/actions/settings")).getSettings();
        if (result.success) {
            setGlobalSettings(result.settings);
        }
    };

    const fetchOrders = async () => {
        try {
            const response = await fetch("/api/orders");
            const data = await response.json();

            if (data.success) {
                // Filter only pending orders
                const pendingOrders = data.orders.filter(
                    (order: Order) => order.status === "PENDING"
                );
                setOrders(pendingOrders);
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoading(false);
        }
    };

    const getGrandTotal = () => {
        return orders.reduce((total, order) => total + order.total, 0);
    };

    const getTotalItems = () => {
        return orders.reduce((total, order) => {
            return total + order.items.reduce((sum, item) => sum + item.quantity, 0);
        }, 0);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPaymentProof(file);
            // Create preview URL
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name || !address || !phone || !email) {
            alert("กรุณากรอกข้อมูลให้ครบถ้วน");
            return;
        }

        if (!paymentProof) {
            alert("กรุณาอัพโหลดหลักฐานการโอนเงิน");
            return;
        }

        setSubmitting(true);

        try {
            // Update user profile info if logged in
            if (session?.user?.id && session.user.id !== "guest-user") {
                await updateUserInfo(session.user.id, {
                    name,
                    phone,
                    address
                });
            }

            const formData = new FormData();
            formData.append("name", name);
            formData.append("address", address);
            formData.append("phone", phone);
            formData.append("email", email);
            formData.append("paymentProof", paymentProof);
            formData.append("orderIds", JSON.stringify(orders.map(o => o.id)));
            formData.append("total", getGrandTotal().toString());

            const response = await fetch("/api/checkout", {
                method: "POST",
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                alert("ส่งข้อมูลการชำระเงินเรียบร้อยแล้ว!\nเราจะตรวจสอบและติดต่อกลับโดยเร็วที่สุด");
                router.push("/cart");
            } else {
                alert("เกิดข้อผิดพลาด: " + result.error);
            }
        } catch (error) {
            console.error("Error submitting checkout:", error);
            alert("เกิดข้อผิดพลาดในการส่งข้อมูล");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                <div className="text-white text-2xl">กำลังโหลด...</div>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                <header className="bg-black/30 backdrop-blur-md border-b border-white/10">
                    <div className="container mx-auto px-4 py-4">
                        <Link href="/" className="text-2xl font-bold text-white hover:text-purple-300 transition-colors">
                            🎨 Stamp Printing App
                        </Link>
                    </div>
                </header>
                <div className="container mx-auto px-4 py-16 text-center">
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 border border-white/20 max-w-md mx-auto">
                        <div className="text-6xl mb-4">🛒</div>
                        <h2 className="text-2xl font-bold text-white mb-2">ไม่มีรายการที่รอชำระเงิน</h2>
                        <p className="text-purple-200 mb-6">กรุณาเพิ่มสินค้าลงตะกร้าก่อน</p>
                        <Link
                            href="/cart"
                            className="inline-block px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-lg font-bold transition-all"
                        >
                            กลับไปตะกร้า
                        </Link>
                    </div>
                </div>
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
                    <Link
                        href="/cart"
                        className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
                    >
                        กลับไปตะกร้า
                    </Link>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">💳 ชำระเงิน</h1>
                    <p className="text-purple-200">
                        {getTotalItems()} รายการ • ยอดรวม {getGrandTotal().toFixed(2)} บาท
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Left Column: Info & Form */}
                    <div className="space-y-6">
                        {/* Bank Account Info & QR Code */}
                        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 border border-white/20">
                            <h2 className="text-2xl font-bold text-white mb-4">🏦 ช่องทางการชำระเงิน</h2>

                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Bank Details */}
                                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 space-y-2">
                                    <h3 className="text-white font-bold mb-2 border-b border-white/20 pb-1">โอนผ่านบัญชีธนาคาร</h3>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-white/80">ธนาคาร:</span>
                                        <span className="text-white font-bold">{globalSettings?.bankName || "ธนาคารกสิกรไทย"}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-white/80">ชื่อบัญชี:</span>
                                        <span className="text-white font-bold">{globalSettings?.accountName || "Stamp Printing Co., Ltd."}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-white/80">เลขที่บัญชี:</span>
                                        <span className="text-white font-bold">{globalSettings?.accountNumber || "123-4-56789-0"}</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-2 border-t border-white/20">
                                        <span className="text-white/80">ยอดที่ต้องชำระ:</span>
                                        <span className="text-white font-bold text-xl">{getGrandTotal().toFixed(2)} ฿</span>
                                    </div>
                                </div>

                                {/* QR Code */}
                                <div className="bg-white rounded-xl p-4 flex flex-col items-center justify-center text-center">
                                    <h3 className="text-slate-900 font-bold mb-3">แสกน QR PromptPay</h3>
                                    <div className="bg-white p-2 rounded-lg border-2 border-slate-100 shadow-inner mb-2">
                                        <QRCodeCanvas
                                            value={generatePayload(globalSettings?.promptPayId || "0811234567", { amount: getGrandTotal() })}
                                            size={160}
                                            level="H"
                                            includeMargin={false}
                                        />
                                    </div>
                                    <p className="text-xs text-slate-900 font-bold mb-0.5">{globalSettings?.accountName || "Stamp Printing Co., Ltd."}</p>
                                    <p className="text-[10px] text-slate-500 font-bold">{globalSettings?.promptPayId || "081-123-4567"}</p>
                                    <p className="text-[9px] text-slate-400">แสกนด้วยแอปธนาคารใดก็ได้</p>
                                </div>
                            </div>
                        </div>

                        {/* Customer Info Form */}
                        <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 space-y-4">
                            <h2 className="text-2xl font-bold text-white mb-4">📝 ข้อมูลผู้สั่งซื้อ</h2>

                            <div>
                                <label className="block text-purple-200 mb-2">ชื่อ-นามสกุล *</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="กรอกชื่อ-นามสกุล"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-purple-200 mb-2">ที่อยู่สำหรับจัดส่ง *</label>
                                <textarea
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="กรอกที่อยู่สำหรับจัดส่ง"
                                    rows={3}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-purple-200 mb-2">เบอร์โทรศัพท์ *</label>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        placeholder="0xx-xxx-xxxx"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-purple-200 mb-2">อีเมล *</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        placeholder="example@email.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-purple-200 mb-2">หลักฐานการโอนเงิน *</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    id="payment-proof"
                                    required
                                />
                                <label
                                    htmlFor="payment-proof"
                                    className="block w-full px-4 py-3 bg-white/10 border-2 border-dashed border-white/20 rounded-lg text-center cursor-pointer hover:bg-white/20 transition-all"
                                >
                                    {paymentProof ? (
                                        <span className="text-green-300">✓ {paymentProof.name}</span>
                                    ) : (
                                        <span className="text-purple-200">📎 คลิกเพื่ออัพโหลดสลิปโอนเงิน</span>
                                    )}
                                </label>
                                {previewUrl && (
                                    <div className="mt-4">
                                        <img
                                            src={previewUrl}
                                            alt="Payment proof preview"
                                            className="w-full max-w-sm mx-auto rounded-lg border-2 border-white/20"
                                        />
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-xl font-bold text-lg shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {submitting ? "กำลังส่งข้อมูล..." : "ยืนยันการชำระเงิน"}
                            </button>
                        </form>
                    </div>

                    {/* Right Column: Order Summary */}
                    <div className="space-y-6">
                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 sticky top-8">
                            <h2 className="text-2xl font-bold text-white mb-4">📦 สรุปคำสั่งซื้อ</h2>

                            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                                {orders.map((order) => (
                                    <div key={order.id} className="border-b border-white/10 pb-4 last:border-0">
                                        <p className="text-sm text-purple-200 mb-2">
                                            คำสั่งซื้อ #{order.id}
                                        </p>
                                        {order.items.map((item) => (
                                            <div key={item.id} className="flex gap-3 mb-4 items-center bg-white/5 p-3 rounded-xl border border-white/10">
                                                <div className="flex gap-1">
                                                    <img
                                                        src={item.customImageUrl}
                                                        alt="Custom"
                                                        className="w-12 h-12 rounded-lg object-cover border border-purple-300/50"
                                                    />
                                                    <img
                                                        src={item.previewUrl}
                                                        alt="Background"
                                                        className="w-12 h-12 rounded-lg object-contain border border-blue-300/50 bg-white/10"
                                                    />
                                                </div>
                                                <div className="flex-grow">
                                                    <p className="text-white font-bold text-sm leading-tight">{item.template.name}</p>
                                                    <p className="text-purple-200 text-xs mt-1">
                                                        {item.quantity} ชิ้น × {item.price.toFixed(2)} ฿
                                                    </p>
                                                </div>
                                                <div className="text-white font-bold text-right">
                                                    {(item.quantity * item.price).toFixed(2)} ฿
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>

                            <div className="pt-4 border-t border-white/20 mt-4">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-purple-200">จำนวนรายการ:</span>
                                    <span className="text-white font-bold">{getTotalItems()} ชิ้น</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xl text-white font-bold">ยอดรวมทั้งหมด:</span>
                                    <span className="text-2xl text-white font-bold">
                                        {getGrandTotal().toFixed(2)} ฿
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
