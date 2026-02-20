import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getUserOrders, getUser } from "@/app/actions/user";
import Link from "next/link";
import Image from "next/image";
import ProfileInfo from "./ProfileInfo";

export default async function ProfilePage() {
    const session = await auth();

    if (!session || !session.user?.id) {
        redirect("/login");
    }

    const [orders, user] = await Promise.all([
        getUserOrders(session.user.id),
        getUser(session.user.id)
    ]);

    if (!user) {
        redirect("/login");
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="mb-12">
                    <ProfileInfo user={{ ...user, id: session.user.id }} />
                </div>

                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-white border-b border-white/10 pb-4">ประวัติการสั่งซื้อ</h2>

                    {orders.length === 0 ? (
                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 text-center border border-white/10">
                            <p className="text-purple-200 mb-6 text-lg">คุณยังไม่มีประวัติการสั่งซื้อ</p>
                            <Link
                                href="/editor"
                                className="inline-block bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-3 rounded-xl font-bold hover:scale-105 transition-all"
                            >
                                เริ่มสร้างแสตมป์เลย
                            </Link>
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {orders.map((order) => (
                                <div key={order.id} className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                                    <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                                        <div>
                                            <p className="text-sm text-purple-300">เลขอ้างอิง: #{order.id}</p>
                                            <p className="text-white font-bold">วันที่สั่ง: {new Date(order.createdAt).toLocaleDateString('th-TH')}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className={`px-4 py-1 rounded-full text-xs font-bold ${order.status === 'PENDING' ? 'bg-yellow-500 text-white' :
                                                order.status === 'PAID' ? 'bg-green-500 text-white' :
                                                    order.status === 'SHIPPED' ? 'bg-blue-500 text-white' :
                                                        'bg-purple-500 text-white'
                                                }`}>
                                                {order.status === 'PENDING' ? 'รอชำระเงิน' :
                                                    order.status === 'PAID' ? 'ชำระแล้ว' :
                                                        order.status === 'SHIPPED' ? 'จัดส่งแล้ว' : 'สำเร็จ'}
                                            </span>
                                            <p className="text-2xl font-bold text-white mt-1">{order.total.toFixed(2)} ฿</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        {order.items.map((item) => (
                                            <div key={item.id} className="flex items-center gap-4 bg-black/20 p-3 rounded-xl">
                                                <div className="flex gap-2 shrink-0">
                                                    <div className="relative group">
                                                        <Image
                                                            src={item.customImageUrl}
                                                            alt="user"
                                                            width={48}
                                                            height={48}
                                                            className="w-12 h-12 rounded object-cover border border-purple-500/30 bg-white"
                                                            unoptimized
                                                        />
                                                        <span className="absolute -top-2 -left-1 bg-purple-500 text-[8px] text-white px-1 rounded-sm scale-75 opacity-0 group-hover:opacity-100 transition-opacity">USER</span>
                                                    </div>
                                                    <div className="relative group">
                                                        <Image
                                                            src={item.previewUrl}
                                                            alt="background"
                                                            width={48}
                                                            height={48}
                                                            className="w-12 h-12 rounded object-cover border border-blue-500/30 bg-white"
                                                            unoptimized
                                                        />
                                                        <span className="absolute -top-2 -left-1 bg-blue-500 text-[8px] text-white px-1 rounded-sm scale-75 opacity-0 group-hover:opacity-100 transition-opacity">BG</span>
                                                    </div>
                                                </div>
                                                <div className="flex-grow">
                                                    <p className="text-white font-medium text-sm">{item.template.name}</p>
                                                    <p className="text-xs text-purple-300">จำนวน: {item.quantity} | {item.price}฿ ต่อชิ้น</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {order.status === 'PENDING' && (
                                        <div className="mt-6 flex justify-end">
                                            <Link
                                                href="/checkout"
                                                className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg text-sm font-bold transition-all"
                                            >
                                                ไปหน้าชำระเงิน
                                            </Link>
                                        </div>
                                    )}

                                    {(order as any).trackingNumber && (
                                        <div className="mt-6 bg-purple-500/10 border border-purple-500/30 p-4 rounded-xl">
                                            <p className="text-xs text-purple-300 uppercase font-bold mb-1">เลขพัสดุสำหรับจัดส่ง</p>
                                            <p className="text-xl font-mono text-white tracking-widest">{(order as any).trackingNumber}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
