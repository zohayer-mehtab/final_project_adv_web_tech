"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function VendorOrdersPage() {
    const router = useRouter();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchVendorOrders = async () => {
            const token = window.localStorage.getItem("token");
            if (!token) { router.push("/login"); return; }
            try {
                const res = await axios.get("http://localhost:3000/orders/vendor-orders", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setOrders(res.data);
            } catch (err) { console.error(err); } finally { setLoading(false); }
        };
        fetchVendorOrders();
    }, [router]);

    const handleStatusUpdate = async (orderId: string, newStatus: string) => {
        const token = window.localStorage.getItem("token");
        
        try {
            await axios.patch(`http://localhost:3000/orders/${orderId}/status`, 
                { status: newStatus }, // Send the exact string directly (e.g., "Shipped")
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            // Update the UI immediately
            setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        } catch (err: any) {
            console.error(err);
            alert(err.response?.data?.message || "Failed to update status");
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="bg-white p-6 rounded shadow border border-gray-200">
            <h1 className="text-2xl font-bold mb-6">Manage Orders</h1>
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b bg-gray-50">
                        <th className="p-3">Order ID</th>
                        <th className="p-3">Product</th>
                        <th className="p-3">Total</th>
                        <th className="p-3">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map(o => (
                        <tr key={o.id} className="border-b">
                            <td className="p-3 text-sm">#{o.id.slice(0,8)}</td>
                            <td className="p-3 text-sm">{o.product?.name || "N/A"}</td>
                            <td className="p-3 text-sm font-semibold">
                                ৳ {(o.quantity * (o.product?.price || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                            <td className="p-3">
                                <select 
                                    value={o.status} // Now "Pending" matches value="Pending" perfectly
                                    onChange={(e) => handleStatusUpdate(o.id, e.target.value)}
                                    className="border border-gray-300 rounded p-1 text-sm bg-white"
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="Shipped">Shipped</option>
                                    <option value="Delivered">Delivered</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}