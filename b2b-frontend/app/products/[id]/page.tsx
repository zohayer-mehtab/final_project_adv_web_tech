"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ProductDetailsPage({ params }: { params: any }) {
    const { id } = React.use(params);
    const router = useRouter();

    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");
    
    const [orderQuantity, setOrderQuantity] = useState<number>(1);
    const [orderSuccess, setOrderSuccess] = useState<string>("");
    const [orderError, setOrderError] = useState<string>("");

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/products/${id}`);
                setProduct(response.data);
                setError("");
            } catch (err) {
                console.error("Error fetching product:", err);
                setError("Failed to load product details. It may not exist.");
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

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
            router.push("/login"); // If token is invalid, send to login
        }
    };

    const handlePlaceOrder = async () => {
        const token = window.localStorage.getItem("token");
        
        if (!token) {
            router.push("/login");
            return;
        }

        try {
            setOrderError("");
            await axios.post(
                "http://localhost:3000/orders",
                {
                    productId: parseInt(id),
                    quantity: parseInt(orderQuantity.toString())
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            
            setOrderSuccess("Order placed successfully!");
            setTimeout(() => router.push("/orders"), 2000);
            
        } catch (err: any) {
            if (err.response && err.response.data && err.response.data.message) {
                const errMsg = Array.isArray(err.response.data.message) 
                    ? err.response.data.message[0] 
                    : err.response.data.message;
                setOrderError(errMsg);
            } else {
                setOrderError("Failed to place order.");
            }
        }
    };

    if (loading) {
        return (
            <div data-theme="light" className="min-h-screen flex items-center justify-center bg-[#FFFFFF]">
                <span className="loading loading-spinner loading-lg text-[#367AFF]"></span>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div data-theme="light" className="min-h-screen flex flex-col items-center justify-center bg-[#FFFFFF]">
                <h1 className="text-[24px] font-bold text-[#EF4444] mb-4">{error}</h1>
                <Link href="/" className="h-[54px] px-8 rounded-[10px] text-[#367AFF] border border-[#367AFF] font-semibold flex items-center justify-center hover:bg-[#F0F5FF]">Back to Marketplace</Link>
            </div>
        );
    }

    return (
        <div data-theme="light" className="min-h-screen bg-[#FFFFFF] font-sans pb-12">
            
            {/* Header Navbar */}
            <header className="flex items-center justify-between px-8 py-4 border-b border-[#E5E7EB] bg-[#FFFFFF]">
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
                    className="h-[36px] w-[36px] rounded-full border border-[#D9D9D9] hover:border-[#9A9A9A] bg-transparent flex items-center justify-center transition-colors cursor-pointer"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-[#6C6C6C]">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                    </svg>
                </button>
            </header>

            {/* Main Content Area */}
            <div className="max-w-[1000px] mx-auto px-6 pt-8">
                
                <Link href="/" className="text-[#6C6C6C] hover:text-[#367AFF] flex items-center gap-2 mb-6 text-[16px] font-medium transition-colors w-fit">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                    </svg>
                    Back to Marketplace
                </Link>

                {/* Main Product Card */}
                <div className="bg-[#FFFFFF] rounded-[12px] border border-[#E5E7EB] overflow-hidden flex flex-col md:flex-row">
                    
                    {/* Left Side: Product Image */}
                    <div className="w-full md:w-1/2 bg-[#F4F5F7] min-h-[300px] flex items-center justify-center transition-colors hover:bg-[#EDF2FA]">
                         <span className="text-[32px] font-semibold text-[#232323] tracking-tight">
                             No Image
                         </span>
                    </div>

                    {/* Right Side: Product Details */}
                    <div className="w-full md:w-1/2 p-8 flex flex-col">
                        <div className="inline-flex h-[36px] items-center px-4 rounded-full border border-[#367AFF] text-[#367AFF] bg-[#F0F5FF] text-[14px] font-medium mb-4 w-fit">
                            {product.vendor?.companyName || product.vendor?.username || "Verified Vendor"}
                        </div>
                        
                        <h1 className="text-[36px] font-bold text-[#232323] tracking-[-0.04em] leading-tight mb-2">
                            {product.name}
                        </h1>
                        
                        <p className="text-[24px] font-bold text-[#059669] mb-6">
                            ৳ {Number(product.price).toFixed(2)}
                        </p>

                        <div className="border-t border-[#E5E7EB] my-0"></div>

                        <div className="py-6">
                            <h3 className="text-[18px] font-semibold text-[#232323] mb-2">Description</h3>
                            <p className="text-[#6C6C6C] text-[16px] leading-relaxed whitespace-pre-wrap">
                                {product.description}
                            </p>
                        </div>

                        <div className="mt-auto pt-6 border-t border-[#E5E7EB]">
                            <p className="text-[16px] font-medium text-[#6C6C6C] mb-4">
                                Available Stock: <span className="text-[#232323] font-bold">{product.stock} units</span>
                            </p>

                            {orderError && <div className="bg-[#FEF2F2] text-[#EF4444] rounded-[10px] py-3 px-4 mb-4 text-[15px] font-medium border border-[#FCA5A5]">{orderError}</div>}
                            {orderSuccess && <div className="bg-[#ECFDF5] text-[#059669] rounded-[10px] py-3 px-4 mb-4 text-[15px] font-medium border border-[#A7F3D0]">{orderSuccess}</div>}

                            {/* Ordering Controls */}
                            <div className="flex gap-4 items-center">
                                <input 
                                    type="number" 
                                    min="1" 
                                    max={product.stock}
                                    value={orderQuantity}
                                    onChange={(e) => setOrderQuantity(Number(e.target.value))}
                                    className="w-[100px] h-[54px] px-4 rounded-[10px] bg-transparent text-[18px] text-[#232323] text-center font-bold border border-[#D9D9D9] focus:border-[#367AFF] focus:outline-none"
                                />
                                
                                <button 
                                    onClick={handlePlaceOrder}
                                    disabled={product.stock < 1 || orderQuantity > product.stock}
                                    className="h-[54px] flex-1 rounded-[10px] bg-[#367AFF] text-[#FFFFFF] text-[18px] font-semibold transition-colors hover:bg-[#2860cc] disabled:bg-[#E5E7EB] disabled:text-[#9A9A9A] border-none"
                                >
                                    Place Order
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}