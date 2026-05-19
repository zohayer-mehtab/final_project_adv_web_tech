"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const handleLogout = () => {
        window.localStorage.removeItem("token");
        window.location.href = "/login";
    };

    const navItems = [
        { name: "Vendor Approvals", href: "/admin/users" },
        { name: "Product Approvals", href: "/admin/products" },
    ];

    return (
        <div className="flex h-screen bg-gray-50 font-sans text-gray-900">
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
                <Link href="/" className="p-6 flex items-center hover:opacity-80 transition-opacity">
                        <span className="text-[24px] font-bold tracking-[-0.04em] text-[#232323] flex items-center gap-1.5">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6 2V22M6 10A6 6 0 0 1 6 22" stroke="#367AFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            b2b.<span className="text-[#367AFF] font-medium">marketplace</span>
                        </span>
                    </Link>
                <nav className="flex-1 px-4 py-6 space-y-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link 
                                key={item.name} 
                                href={item.href} 
                                className={`block px-4 py-2 rounded transition-colors ${
                                    isActive ? "bg-blue-600 text-white font-medium" : "text-gray-600 hover:bg-gray-100"
                                }`}
                            >
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
                <div className="p-4 border-t border-gray-200">
                    <button onClick={handleLogout} className="text-red-600 font-medium px-4 py-2 w-full text-left hover:bg-red-50 rounded">
                        Log Out
                    </button>
                </div>
            </aside>
            <main className="flex-1 overflow-y-auto p-8">{children}</main>
        </div>
    );
}