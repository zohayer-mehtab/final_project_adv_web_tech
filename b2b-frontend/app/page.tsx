"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation"; 

export default function MarketplaceHome() {
    const router = useRouter(); 
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get("http://localhost:3000/products");
                setProducts(response.data);
                setError("");
            } catch (err) {
                console.error("Error fetching products:", err);
                setError("Failed to load products. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    
    const handleProfileRedirect = async () => {
        const token = window.localStorage.getItem("token");
        if (!token) {
            router.push("/login");
            return;
        }

        try {
            const res = await axios.get("http://localhost:3000/auth/me", {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            const role = (res.data.role || "").toLowerCase();
            
            if (role === "admin") {
                router.push("/admin/users");
            } else if (role === "vendor") {
                router.push("/vendor/profile");
            } else {
                router.push("/profile"); 
            }
        } catch (err) {
            router.push("/login"); 
        }
    };

    return (
        <div data-theme="light" className="min-h-screen bg-[#FFFFFF] font-sans pb-12">
            
            <header className="flex items-center justify-between px-8 py-4 border-b border-[#E5E7EB] bg-white">
                <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 2V22M6 10A6 6 0 0 1 6 22" stroke="#367AFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="text-[20px] font-semibold tracking-[-0.04em] text-[#232323]">
                        b2b Marketplace
                    </span>
                </Link>

                <button 
                    onClick={handleProfileRedirect} 
                    className="btn btn-circle btn-ghost btn-sm border border-[#D9D9D9] hover:border-[#9A9A9A] bg-transparent flex items-center justify-center cursor-pointer"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-[#6C6C6C]">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                    </svg>
                </button>
            </header>

            <main className="max-w-[1100px] mx-auto px-6 mt-10">
                
                {error && (
                    <div className="bg-red-50 text-red-500 rounded-[10px] py-4 px-6 mb-6 text-center font-medium border border-red-200">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <span className="loading loading-spinner loading-lg text-[#367AFF]"></span>
                    </div>
                ) : (
                    /* Products Grid */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products.length > 0 ? (
                            products.map((product) => (
                                /* Product Card */
                                <div 
                                    key={product.id || product._id} 
                                    className="card bg-[#FFFFFF] border border-[#E5E7EB] hover:border-[#367AFF] transition-all duration-200 rounded-[12px] overflow-hidden group"
                                >
                                    <div className="h-[220px] bg-[#F4F5F7] flex items-center justify-center transition-colors group-hover:bg-[#EDF2FA]">
                                        {product.imageUrl ? (
                                            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-[32px] font-semibold text-[#232323] tracking-tight">
                                                No Image
                                            </span>
                                        )}
                                    </div>

                                    <div className="p-5 flex flex-col gap-2">
                                        <h2 className="text-[18px] font-bold text-[#232323] tracking-tight truncate">
                                            {product.name}
                                        </h2>
                                        
                                        <p className="text-[13px] text-[#6C6C6C] leading-[1.6] line-clamp-3 min-h-[62px]">
                                            {product.description || "No description available."}
                                        </p>
                                        
                                        <div className="flex justify-between items-center mt-3">
                                            <span className="text-[16px] font-bold text-[#059669]">
                                                ৳ {Number(product.price).toFixed(2)}
                                            </span>
                                            
                                            <Link 
                                                href={`/products/${product.id || product._id}`}
                                                className="btn btn-sm bg-[#367AFF] hover:bg-[#2860cc] text-white border-none rounded-[6px] px-5 h-[36px] font-semibold text-[13px] normal-case transition-colors flex items-center"
                                            >
                                                View Details
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            /* Empty State */
                            <div className="col-span-full text-center py-20 text-[#6C6C6C] font-medium">
                                No products found.
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}