"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function VendorProductsPage() {
    const router = useRouter();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchProducts = async () => {
            const token = window.localStorage.getItem("token");
            if (!token) { router.push("/login"); return; }
            try {
                const res = await axios.get("http://localhost:3000/products/my-products", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setProducts(res.data);
            } catch (err) { console.error(err); } finally { setLoading(false); }
        };
        fetchProducts();
    }, []);

    if (loading) return <div className="p-10">Loading...</div>;

    return (
        <div className="p-8">
            <div className="flex justify-between mb-6">
                <h1 className="text-2xl font-bold">My Products</h1>
                <Link href="/vendor/products/new" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Add New</Link>
            </div>
            
            <table className="w-full border-collapse border border-gray-200">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border p-3 text-left">Name</th>
                        <th className="border p-3 text-left">Price</th>
                        <th className="border p-3 text-left">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map(p => (
                        <tr key={p.id}>
                            <td className="border p-3">{p.name}</td>
                            <td className="border p-3">৳ {p.price}</td>
                            <td className="border p-3">
                                <span className={`px-2 py-1 rounded text-xs ${p.isApproved ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                                    {p.isApproved ? "Approved" : "Pending"}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}