"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";

export default function AdminProductApprovals() {
    const [products, setProducts] = useState<any[]>([]);

    useEffect(() => {
        const fetchProducts = async () => {
            const token = window.localStorage.getItem("token");
            const res = await axios.get("http://localhost:3000/products", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProducts(res.data.filter((p: any) => !p.isApproved));
        };
        fetchProducts();
    }, []);

    const updateStatus = async (id: number, action: 'approve' | 'reject') => {
        const token = window.localStorage.getItem("token");
        await axios.patch(`http://localhost:3000/admin/products/${id}/${action}`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setProducts(products.filter(p => p.id !== id));
    };

    return (
        <div className="bg-white p-6 rounded shadow border border-gray-200">
            <h1 className="text-2xl font-bold mb-6">Product Approvals</h1>
            <table className="w-full border-collapse">
                <thead><tr className="border-b"><th className="p-3 text-left">Product</th><th className="p-3 text-left">Price</th><th className="p-3 text-left">Action</th></tr></thead>
                <tbody>
                    {products.map(p => (
                        <tr key={p.id} className="border-b">
                            <td className="p-3">{p.name}</td>
                            <td className="p-3">৳ {p.price}</td>
                            <td className="p-3 space-x-2">
                                <button onClick={() => updateStatus(p.id, 'approve')} className="bg-green-600 text-white px-3 py-1 rounded text-sm">Approve</button>
                                <button onClick={() => updateStatus(p.id, 'reject')} className="bg-red-600 text-white px-3 py-1 rounded text-sm">Reject</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}