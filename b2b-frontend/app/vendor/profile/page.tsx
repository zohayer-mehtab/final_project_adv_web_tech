"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function VendorProfilePage() {
    const router = useRouter();
    const [formData, setFormData] = useState({ username: "", email: "", companyName: "" });
    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            const token = window.localStorage.getItem("token");
            if (!token) {
                router.push("/login");
                return;
            }
            try {
                const res = await axios.get("http://localhost:3000/auth/me", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setFormData({ 
                    username: res.data.username || "", 
                    email: res.data.email || "", 
                    companyName: res.data.companyName || "" 
                });
            } catch (err) {
                setMessage("Failed to load profile.");
                setIsError(true);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("");
        const token = window.localStorage.getItem("token");
        try {
            await axios.patch("http://localhost:3000/auth/me", formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage("Profile updated successfully!");
            setIsError(false);
        } catch (err) { 
            setMessage("Update failed. Please try again."); 
            setIsError(true);
        }
    };

    if (loading) {
        return (
            <div data-theme="light" className="flex justify-center items-center h-64">
                <div className="w-8 h-8 border-4 border-[#D9D9D9] border-t-[#367AFF] rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div data-theme="light" className="max-w-[700px] mx-auto pb-16">
            
            <div className="mb-10">
                <h1 className="text-[36px] font-bold text-[#232323] tracking-[-0.04em] leading-tight">
                    Vendor Profile
                </h1>
                <p className="text-[16px] font-normal text-[#969696] mt-2">
                    Manage your account details and business identity.
                </p>
            </div>

            <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[12px] p-8 shadow-sm">
                {message && (
                    <div className={`rounded-[8px] py-4 px-4 mb-6 border ${isError ? 'bg-[#FEF2F2] border-[#EF4444] text-[#EF4444]' : 'bg-[#F0FDF4] border-[#059669] text-[#059669]'} font-medium text-[14px]`}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    <div className="relative w-full form-control">
                        <input 
                            type="text" 
                            value={formData.username} 
                            onChange={e => setFormData({...formData, username: e.target.value})}
                            placeholder="Username"
                            className="peer placeholder:text-transparent w-full h-[54px] px-4 rounded-[10px] bg-transparent text-[16px] text-[#232323] border border-[#D9D9D9] focus:border-[#367AFF] focus:border-[1.5px] focus:outline-none [&:-webkit-autofill]:shadow-[inset_0_0_0px_1000px_#ffffff] [&:-webkit-autofill]:-webkit-text-fill-color-[#232323]"
                            required
                        />
                        <label className="absolute left-3 px-1 bg-[#FFFFFF] transition-all duration-200 pointer-events-none top-4 text-[16px] text-[#9A9A9A] peer-placeholder-shown:top-4 peer-placeholder-shown:text-[16px] peer-placeholder-shown:text-[#9A9A9A] peer-focus:-top-2.5 peer-focus:text-[13px] peer-focus:text-[#367AFF] peer-focus:font-medium [&:not(:placeholder-shown)]:-top-2.5 [&:not(:placeholder-shown)]:text-[13px] [&:not(:placeholder-shown)]:font-medium">
                            Username
                        </label>
                    </div>

                    <div className="relative w-full form-control">
                        <input 
                            type="email" 
                            value={formData.email} 
                            onChange={e => setFormData({...formData, email: e.target.value})}
                            placeholder="Email Address"
                            className="peer placeholder:text-transparent w-full h-[54px] px-4 rounded-[10px] bg-transparent text-[16px] text-[#232323] border border-[#D9D9D9] focus:border-[#367AFF] focus:border-[1.5px] focus:outline-none [&:-webkit-autofill]:shadow-[inset_0_0_0px_1000px_#ffffff] [&:-webkit-autofill]:-webkit-text-fill-color-[#232323]"
                            required
                        />
                        <label className="absolute left-3 px-1 bg-[#FFFFFF] transition-all duration-200 pointer-events-none top-4 text-[16px] text-[#9A9A9A] peer-placeholder-shown:top-4 peer-placeholder-shown:text-[16px] peer-placeholder-shown:text-[#9A9A9A] peer-focus:-top-2.5 peer-focus:text-[13px] peer-focus:text-[#367AFF] peer-focus:font-medium [&:not(:placeholder-shown)]:-top-2.5 [&:not(:placeholder-shown)]:text-[13px] [&:not(:placeholder-shown)]:font-medium">
                            Email Address
                        </label>
                    </div>

                    <div className="relative w-full form-control">
                        <input 
                            type="text" 
                            value={formData.companyName} 
                            onChange={e => setFormData({...formData, companyName: e.target.value})}
                            placeholder="Company Name"
                            className="peer placeholder:text-transparent w-full h-[54px] px-4 rounded-[10px] bg-transparent text-[16px] text-[#232323] border border-[#D9D9D9] focus:border-[#367AFF] focus:border-[1.5px] focus:outline-none [&:-webkit-autofill]:shadow-[inset_0_0_0px_1000px_#ffffff] [&:-webkit-autofill]:-webkit-text-fill-color-[#232323]"
                        />
                        <label className="absolute left-3 px-1 bg-[#FFFFFF] transition-all duration-200 pointer-events-none top-4 text-[16px] text-[#9A9A9A] peer-placeholder-shown:top-4 peer-placeholder-shown:text-[16px] peer-placeholder-shown:text-[#9A9A9A] peer-focus:-top-2.5 peer-focus:text-[13px] peer-focus:text-[#367AFF] peer-focus:font-medium [&:not(:placeholder-shown)]:-top-2.5 [&:not(:placeholder-shown)]:text-[13px] [&:not(:placeholder-shown)]:font-medium">
                            Company Name
                        </label>
                    </div>

                    <div className="pt-2">
                        <button 
                            type="submit" 
                            className="w-full h-[54px] rounded-[10px] bg-[#367AFF] text-[#FFFFFF] text-[18px] font-semibold transition-colors hover:bg-[#2860cc] border-none outline-none"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}