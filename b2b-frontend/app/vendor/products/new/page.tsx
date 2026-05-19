"use client";
import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CreateProductPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        stock: ""
    });
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const token = window.localStorage.getItem("token");
        if (!token) {
            router.push("/login");
            return;
        }

        const payload = {
            name: formData.name,
            description: formData.description,
            price: parseFloat(formData.price),
            stock: parseInt(formData.stock, 10)
        };

        try {
            await axios.post("http://localhost:3000/products", payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            router.push("/vendor/products");
        } catch (err: any) {
            if (err.response?.data?.message) {
                const errMsg = Array.isArray(err.response.data.message) 
                    ? err.response.data.message[0] 
                    : err.response.data.message;
                setError(errMsg);
            } else {
                setError("Failed to create product. Please try again.");
            }
            setLoading(false);
        }
    };

    return (
        <div data-theme="light" className="max-w-[700px] mx-auto pb-16">
            
            <div className="mb-8">
                <Link href="/vendor/products" className="inline-flex items-center text-[#6C6C6C] hover:text-[#367AFF] font-medium text-[15px] mb-4 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 mr-2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                    </svg>
                    Back to Products
                </Link>
                <h1 className="text-[36px] font-bold text-[#232323] tracking-[-0.04em]">Add New Product</h1>
            </div>

            <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[12px] p-8 shadow-sm">
                
                {error && (
                    <div className="rounded-[10px] py-4 px-4 mb-6 bg-[#FEF2F2] border border-[#EF4444] text-[#EF4444] font-medium text-[14px]">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    <div className="relative w-full form-control">
                        <input 
                            type="text" 
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Product Name"
                            className="peer placeholder:text-transparent w-full h-[54px] px-4 rounded-[10px] bg-transparent text-[16px] text-[#232323] border border-[#D9D9D9] focus:border-[#367AFF] focus:border-[1.5px] focus:outline-none [&:-webkit-autofill]:shadow-[inset_0_0_0px_1000px_#ffffff] [&:-webkit-autofill]:-webkit-text-fill-color-[#232323]" 
                            required
                        />
                        <label className="absolute left-3 px-1 bg-[#FFFFFF] transition-all duration-200 pointer-events-none top-4 text-[16px] text-[#9A9A9A] peer-placeholder-shown:top-4 peer-placeholder-shown:text-[16px] peer-placeholder-shown:text-[#9A9A9A] peer-focus:-top-2.5 peer-focus:text-[13px] peer-focus:text-[#367AFF] peer-focus:font-medium [&:not(:placeholder-shown)]:-top-2.5 [&:not(:placeholder-shown)]:text-[13px] [&:not(:placeholder-shown)]:font-medium">
                            Product Name
                        </label>
                    </div>

                    <div className="relative w-full form-control">
                        <textarea 
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Description"
                            rows={4}
                            className="peer placeholder:text-transparent w-full px-4 pt-4 pb-2 rounded-[10px] bg-transparent text-[16px] text-[#232323] border border-[#D9D9D9] focus:border-[#367AFF] focus:border-[1.5px] focus:outline-none min-h-[120px]" 
                            required
                        />
                        <label className="absolute left-3 px-1 bg-[#FFFFFF] transition-all duration-200 pointer-events-none top-4 text-[16px] text-[#9A9A9A] peer-placeholder-shown:top-4 peer-placeholder-shown:text-[16px] peer-placeholder-shown:text-[#9A9A9A] peer-focus:-top-2.5 peer-focus:text-[13px] peer-focus:text-[#367AFF] peer-focus:font-medium [&:not(:placeholder-shown)]:-top-2.5 [&:not(:placeholder-shown)]:text-[13px] [&:not(:placeholder-shown)]:font-medium">
                            Description
                        </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="relative w-full form-control">
                            <input 
                                type="number" 
                                name="price"
                                step="0.01"
                                min="0"
                                value={formData.price}
                                onChange={handleInputChange}
                                placeholder="Price"
                                className="peer placeholder:text-transparent w-full h-[54px] px-4 rounded-[10px] bg-transparent text-[16px] text-[#232323] border border-[#D9D9D9] focus:border-[#367AFF] focus:border-[1.5px] focus:outline-none [&:-webkit-autofill]:shadow-[inset_0_0_0px_1000px_#ffffff] [&:-webkit-autofill]:-webkit-text-fill-color-[#232323]" 
                                required
                            />
                            <label className="absolute left-3 px-1 bg-[#FFFFFF] transition-all duration-200 pointer-events-none top-4 text-[16px] text-[#9A9A9A] peer-placeholder-shown:top-4 peer-placeholder-shown:text-[16px] peer-placeholder-shown:text-[#9A9A9A] peer-focus:-top-2.5 peer-focus:text-[13px] peer-focus:text-[#367AFF] peer-focus:font-medium [&:not(:placeholder-shown)]:-top-2.5 [&:not(:placeholder-shown)]:text-[13px] [&:not(:placeholder-shown)]:font-medium">
                                Price (৳)
                            </label>
                        </div>

                        <div className="relative w-full form-control">
                            <input 
                                type="number" 
                                name="stock"
                                min="0"
                                value={formData.stock}
                                onChange={handleInputChange}
                                placeholder="Stock"
                                className="peer placeholder:text-transparent w-full h-[54px] px-4 rounded-[10px] bg-transparent text-[16px] text-[#232323] border border-[#D9D9D9] focus:border-[#367AFF] focus:border-[1.5px] focus:outline-none [&:-webkit-autofill]:shadow-[inset_0_0_0px_1000px_#ffffff] [&:-webkit-autofill]:-webkit-text-fill-color-[#232323]" 
                                required
                            />
                            <label className="absolute left-3 px-1 bg-[#FFFFFF] transition-all duration-200 pointer-events-none top-4 text-[16px] text-[#9A9A9A] peer-placeholder-shown:top-4 peer-placeholder-shown:text-[16px] peer-placeholder-shown:text-[#9A9A9A] peer-focus:-top-2.5 peer-focus:text-[13px] peer-focus:text-[#367AFF] peer-focus:font-medium [&:not(:placeholder-shown)]:-top-2.5 [&:not(:placeholder-shown)]:text-[13px] [&:not(:placeholder-shown)]:font-medium">
                                Initial Stock
                            </label>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full h-[54px] rounded-[10px] bg-[#367AFF] text-[#FFFFFF] text-[18px] font-semibold transition-colors hover:bg-[#2860cc] border-none outline-none disabled:bg-[#9A9A9A] disabled:cursor-not-allowed"
                        >
                            {loading ? "Creating..." : "Create Product"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}