"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";

export default function AdminVendorApprovals() {
    const [vendors, setVendors] = useState<any[]>([]);

    useEffect(() => {
        const fetchVendors = async () => {
            const token = window.localStorage.getItem("token");
            const res = await axios.get("http://localhost:3000/admin/users", {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Filter: Role is vendor AND isApproved is false
            setVendors(res.data.filter((u: any) => u.role === 'vendor' && !u.isApproved));
        };
        fetchVendors();
    }, []);

    const updateStatus = async (id: string, action: 'approve' | 'reject') => {
        const token = window.localStorage.getItem("token");
        await axios.patch(`http://localhost:3000/admin/users/${id}/${action}`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setVendors(vendors.filter(v => v.id !== id));
    };

    return (
        <div className="bg-white p-6 rounded shadow border border-gray-200">
            <h1 className="text-2xl font-bold mb-6">Vendor Approvals</h1>
            <table className="w-full border-collapse">
                <thead><tr className="border-b"><th className="p-3 text-left">Vendor</th><th className="p-3 text-left">Action</th></tr></thead>
                <tbody>
                    {vendors.map(v => (
                        <tr key={v.id} className="border-b">
                            <td className="p-3">{v.username} ({v.email})</td>
                            <td className="p-3 space-x-2">
                                <button onClick={() => updateStatus(v.id, 'approve')} className="bg-green-600 text-white px-3 py-1 rounded text-sm">Approve</button>
                                <button onClick={() => updateStatus(v.id, 'reject')} className="bg-red-600 text-white px-3 py-1 rounded text-sm">Reject</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}