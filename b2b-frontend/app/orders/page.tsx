"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function MyOrdersPage() {
    const router = useRouter();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");

    useEffect(() => {
        const fetchOrders = async () => {
            const token = window.localStorage.getItem("token");
            
            if (!token) {
                router.push("/login");
                return;
            }

            try {
                const response = await axios.get("http://localhost:3000/orders/my-orders", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setOrders(response.data);
                setError("");
            } catch (err) {
                console.error("Error fetching orders:", err);
                setError("Failed to load your orders. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [router]);

    const handleCancelOrder = async (orderId: string) => {
        const token = window.localStorage.getItem("token");
        
        if (!window.confirm("Are you sure you want to cancel this order?")) {
            return;
        }

        try {
            await axios.delete(`http://localhost:3000/orders/${orderId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            setOrders(orders.filter(order => order.id !== orderId));
            
        } catch (err: any) {
            alert(err.response?.data?.message || "Failed to cancel the order.");
        }
    };

    const normalizeStatus = (status: any) => {
        if (status === 0 || status === "0" || status === "PENDING") return "PENDING";
        if (status === 1 || status === "1" || status === "SHIPPED") return "SHIPPED";
        if (status === 2 || status === "2" || status === "DELIVERED") return "DELIVERED";
        if (status === 3 || status === "3" || status === "CANCELLED") return "CANCELLED";
        return String(status).toUpperCase();
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "PENDING":
                return (
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FEF3C7] text-[#D97706] text-[13px] font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]"></span>
                        Pending
                    </span>
                );
            case "SHIPPED":
                return (
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E0F2FE] text-[#0284C7] text-[13px] font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0EA5E9]"></span>
                        Shipped
                    </span>
                );
            case "DELIVERED":
                return (
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#DCFCE7] text-[#15803D] text-[13px] font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]"></span>
                        Delivered
                    </span>
                );
            case "CANCELLED":
                return (
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FEE2E2] text-[#B91C1C] text-[13px] font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]"></span>
                        Cancelled
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F4F5F7] text-[#6C6C6C] text-[13px] font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#9A9A9A]"></span>
                        {status}
                    </span>
                );
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-GB', options);
    };

    const handleLogout = () => {
        window.localStorage.removeItem("token");
        window.location.href = "/login";
    };

    if (loading) {
        return (
            <div data-theme="light" className="min-h-screen flex items-center justify-center bg-[#F4F5F7]">
                <div className="w-10 h-10 border-4 border-[#D9D9D9] border-t-[#367AFF] rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div data-theme="light" className="flex h-screen bg-[#F4F5F7] font-sans text-[#232323] overflow-hidden">
            
            <aside className="w-[260px] min-w-[260px] bg-[#FFFFFF] border-r border-[#E5E7EB] h-full flex flex-col z-10">
                
                <div className="px-8 pt-10 pb-8">
                    <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
                        <span className="text-[24px] font-bold tracking-[-0.04em] text-[#232323] flex items-center gap-1.5">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6 2V22M6 10A6 6 0 0 1 6 22" stroke="#367AFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            b2b.<span className="text-[#367AFF] font-medium">marketplace</span>
                        </span>
                    </Link>
                </div>
                
                <nav className="flex-1 px-4 py-2">
                    <ul className="flex flex-col gap-1.5">
                        <li>
                            <Link href="/" className="flex items-center text-[#6C6C6C] hover:text-[#367AFF] font-medium text-[16px] py-3 px-4 rounded-[10px] transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-3"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 1.39L23.25 12l-4.64-4.64m-1.39 1.39L21.21 12l-3.96 3.96M6 21H2.36m0 0V3.64m0 0L.75 12l4.64 4.64M2.36 3.64L7 8.28" /></svg>
                                Marketplace
                            </Link>
                        </li>
                        <li>
                            <Link href="/orders" className="flex items-center bg-[#F0F5FF] text-[#367AFF] font-medium text-[16px] py-3 px-4 rounded-[10px] transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-3"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg>
                                My Orders
                            </Link>
                        </li>
                        <li>
                            <Link href="/profile" className="flex items-center text-[#6C6C6C] hover:text-[#367AFF] font-medium text-[16px] py-3 px-4 rounded-[10px] transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-3"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg>
                                Profile
                            </Link>
                        </li>
                    </ul>
                </nav>

                <div className="p-6 border-t border-[#E5E7EB]">
                    <button onClick={handleLogout} className="flex items-center gap-3 w-full hover:opacity-80 transition-opacity">
                        <div className="w-10 h-10 rounded-full bg-[#232323] text-[#FFFFFF] font-semibold flex items-center justify-center text-[16px]">
                            U
                        </div>
                        <span className="text-[#EF4444] font-medium text-[16px]">Log Out</span>
                    </button>
                </div>
            </aside>

            <main className="flex-1 overflow-y-auto p-10 lg:p-16">
                
                {/* Top Header Row */}
                <div className="max-w-[1200px] w-full mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <h1 className="text-[36px] font-bold text-[#232323] tracking-[-0.04em] leading-tight">
                        My Orders
                    </h1>
                    
                    <Link href="/products" className="h-[48px] px-6 rounded-[10px] bg-[#367AFF] text-[#FFFFFF] text-[16px] font-semibold transition-colors hover:bg-[#2860cc] inline-flex items-center justify-center gap-2 border-none cursor-pointer w-fit">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        New Quotation
                    </Link>
                </div>

                <div className="max-w-[1200px] w-full mx-auto">
                    {error && (
                        <div className="rounded-[10px] py-4 px-4 mb-6 bg-[#FEF2F2] border border-[#EF4444] text-[#EF4444] font-medium text-[14px]">
                            {error}
                        </div>
                    )}

                    {orders.length === 0 && !error ? (
                        <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[12px] p-16 text-center shadow-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto mb-4 text-[#9A9A9A]">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                            </svg>
                            <p className="text-[18px] text-[#6C6C6C] font-medium mb-6">You haven't placed any orders yet.</p>
                            <Link href="/products" className="inline-flex h-[44px] px-6 rounded-[8px] border border-[#D9D9D9] text-[#232323] text-[15px] font-semibold items-center hover:border-[#9A9A9A] transition-colors">
                                Start Shopping
                            </Link>
                        </div>
                    ) : (
                        <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[12px] shadow-sm overflow-hidden">
                            <div className="overflow-x-auto w-full">
                                <table className="w-full text-left border-collapse min-w-[800px]">
                                    <thead>
                                        <tr className="border-b border-[#E5E7EB]">
                                            <th className="py-6 px-8 text-[12px] font-bold text-[#9A9A9A] uppercase tracking-wider w-[15%]">Date</th>
                                            <th className="py-6 px-8 text-[12px] font-bold text-[#9A9A9A] uppercase tracking-wider w-[15%]">Order ID</th>
                                            <th className="py-6 px-8 text-[12px] font-bold text-[#9A9A9A] uppercase tracking-wider w-[25%]">Product</th>
                                            <th className="py-6 px-8 text-[12px] font-bold text-[#9A9A9A] uppercase tracking-wider w-[15%]">Total</th>
                                            <th className="py-6 px-8 text-[12px] font-bold text-[#9A9A9A] uppercase tracking-wider w-[15%]">Status</th>
                                            <th className="py-6 px-8 text-[12px] font-bold text-[#9A9A9A] uppercase tracking-wider w-[15%] text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map((order) => {
                                            const cleanStatus = normalizeStatus(order.status);
                                            
                                            return (
                                                <tr key={order.id} className="border-b border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors group">
                                                    <td className="py-6 px-8 text-[15px] text-[#232323] font-medium">
                                                        {formatDate(order.orderedAt)}
                                                    </td>
                                                    <td className="py-6 px-8 text-[15px] text-[#232323] font-semibold" title={order.id}>
                                                        # {order.id.split('-')[0]}
                                                    </td>
                                                    <td className="py-6 px-8 text-[15px] text-[#6C6C6C] font-medium">
                                                        {order.product?.name || "Product Unavailable"}
                                                        {order.quantity > 1 && <span className="text-[#9A9A9A] ml-1">(x{order.quantity})</span>}
                                                    </td>
                                                    <td className="py-6 px-8 text-[15px] text-[#232323] font-semibold">
                                                        ৳ {((order.quantity || 1) * (order.product?.price || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </td>
                                                    <td className="py-6 px-8">
                                                        {getStatusBadge(cleanStatus)}
                                                    </td>
                                                    <td className="py-6 px-8 text-right">
                                                        {cleanStatus === "PENDING" ? (
                                                            <button 
                                                                onClick={() => handleCancelOrder(order.id)}
                                                                className="text-[#EF4444] hover:bg-[#FEF2F2] px-4 py-2 rounded-[8px] text-[13px] font-semibold transition-colors outline-none"
                                                            >
                                                                Cancel
                                                            </button>
                                                        ) : (
                                                            <span className="text-[13px] text-[#D9D9D9] font-medium px-4">--</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </main> 
        </div>
    );
}