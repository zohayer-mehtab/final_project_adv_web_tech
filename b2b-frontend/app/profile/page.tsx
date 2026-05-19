"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ProfilePage() {
    const router = useRouter();
    
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        companyName: "",
        password: "" 
    });
    
    const [updateSuccess, setUpdateSuccess] = useState<string>("");
    const [updateError, setUpdateError] = useState<string>("");

    useEffect(() => {
        const fetchUserProfile = async () => {
            const token = window.localStorage.getItem("token");
            if (!token) {
                router.push("/login");
                return;
            }

            try {
                const response = await axios.get("http://localhost:3000/auth/me", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                setUser(response.data);
                setFormData({
                    username: response.data.username || "",
                    email: response.data.email || "",
                    companyName: response.data.companyName || "",
                    password: "" 
                });
            } catch (err) {
                window.localStorage.removeItem("token");
                router.push("/login");
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, [router]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setUpdateError("");
        setUpdateSuccess("");

        const token = window.localStorage.getItem("token");
        
        const payload: any = {
            username: formData.username,
            email: formData.email,
        };
        
        if (formData.companyName) payload.companyName = formData.companyName;
        if (formData.password) payload.password = formData.password;

        try {
            await axios.patch("http://localhost:3000/auth/me", payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setUpdateSuccess("Profile updated successfully!");
            setFormData(prev => ({ ...prev, password: "" })); 
            
        } catch (err: any) {
            if (err.response?.data?.message) {
                const errMsg = Array.isArray(err.response.data.message) 
                    ? err.response.data.message[0] 
                    : err.response.data.message;
                setUpdateError(errMsg);
            } else {
                setUpdateError("Failed to update profile.");
            }
        }
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
                            <Link href="/orders" className="flex items-center text-[#6C6C6C] hover:text-[#367AFF] font-medium text-[16px] py-3 px-4 rounded-[10px] transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-3"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg>
                                My Orders
                            </Link>
                        </li>
                        <li>
                            <Link href="/profile" className="flex items-center bg-[#F0F5FF] text-[#367AFF] font-medium text-[16px] py-3 px-4 rounded-[10px] transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-3"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg>
                                Profile
                            </Link>
                        </li>
                    </ul>
                </nav>

                <div className="p-6 border-t border-[#E5E7EB]">
                    <button onClick={handleLogout} className="flex items-center gap-3 w-full hover:opacity-80 transition-opacity">
                        <div className="w-10 h-10 rounded-full bg-[#232323] text-[#FFFFFF] font-semibold flex items-center justify-center text-[16px]">
                            {user?.username?.charAt(0).toUpperCase() || 'N'}
                        </div>
                        <span className="text-[#EF4444] font-medium text-[16px]">Log Out</span>
                    </button>
                </div>
            </aside>

            <main className="flex-1 overflow-y-auto p-10 lg:p-16">
                
                <div className="max-w-[580px]">
                    
                    <p className="text-[16px] font-normal text-[#969696] mb-8">
                        Update your personal information and security settings.
                    </p>

                    <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[12px] p-8 shadow-sm">
                        
                        {updateSuccess && (
                            <div className="rounded-[8px] py-3 px-4 mb-6 bg-[#F0FDF4] border border-[#059669] text-[#059669] font-medium text-[14px]">
                                {updateSuccess}
                            </div>
                        )}
                        {updateError && (
                            <div className="rounded-[8px] py-3 px-4 mb-6 bg-[#FEF2F2] border border-[#EF4444] text-[#EF4444] font-medium text-[14px]">
                                {updateError}
                            </div>
                        )}

                        <form onSubmit={handleUpdateProfile} className="flex flex-col gap-6">
                            
                            <div className="flex gap-3 mb-2 pb-6 border-b border-[#E5E7EB]">
                                <div className="uppercase py-1.5 px-5 rounded-full text-[13px] font-medium bg-[#F4F5F7] text-[#6C6C6C] border border-[#D9D9D9]">
                                    {user?.role || 'BUYER'}
                                </div>
                                <div className={`py-1.5 px-5 rounded-full text-[13px] font-medium text-[#FFFFFF] ${user?.isApproved !== false ? 'bg-[#059669]' : 'bg-[#F59E0B]'}`}>
                                    {user?.isApproved !== false ? "Approved Account" : "Pending Approval"}
                                </div>
                            </div>

                            <div className="relative w-full">
                                <input 
                                    type="text" 
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    placeholder="Username"
                                    className="peer placeholder:text-transparent w-full h-[54px] px-4 rounded-[10px] bg-transparent text-[16px] text-[#232323] border border-[#D9D9D9] focus:border-[#367AFF] focus:border-[1.5px] focus:outline-none [&:-webkit-autofill]:shadow-[inset_0_0_0px_1000px_#ffffff] [&:-webkit-autofill]:-webkit-text-fill-color-[#232323]" 
                                    required
                                />
                                <label className="absolute left-3 px-1 bg-[#FFFFFF] transition-all duration-200 pointer-events-none top-4 text-[16px] text-[#9A9A9A] peer-placeholder-shown:top-4 peer-placeholder-shown:text-[16px] peer-placeholder-shown:text-[#9A9A9A] peer-focus:-top-2.5 peer-focus:text-[13px] peer-focus:text-[#367AFF] peer-focus:font-medium [&:not(:placeholder-shown)]:-top-2.5 [&:not(:placeholder-shown)]:text-[13px] [&:not(:placeholder-shown)]:font-medium">
                                    Username
                                </label>
                            </div>

                            <div className="relative w-full">
                                <input 
                                    type="email" 
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="Email Address"
                                    className="peer placeholder:text-transparent w-full h-[54px] px-4 rounded-[10px] bg-transparent text-[16px] text-[#232323] border border-[#D9D9D9] focus:border-[#367AFF] focus:border-[1.5px] focus:outline-none [&:-webkit-autofill]:shadow-[inset_0_0_0px_1000px_#ffffff] [&:-webkit-autofill]:-webkit-text-fill-color-[#232323]" 
                                    required
                                />
                                <label className="absolute left-3 px-1 bg-[#FFFFFF] transition-all duration-200 pointer-events-none top-4 text-[16px] text-[#9A9A9A] peer-placeholder-shown:top-4 peer-placeholder-shown:text-[16px] peer-placeholder-shown:text-[#9A9A9A] peer-focus:-top-2.5 peer-focus:text-[13px] peer-focus:text-[#367AFF] peer-focus:font-medium [&:not(:placeholder-shown)]:-top-2.5 [&:not(:placeholder-shown)]:text-[13px] [&:not(:placeholder-shown)]:font-medium">
                                    Email Address
                                </label>
                            </div>

                            {user?.role === 'vendor' && (
                                <div className="relative w-full">
                                    <input 
                                        type="text" 
                                        name="companyName"
                                        value={formData.companyName}
                                        onChange={handleInputChange}
                                        placeholder="Company Name"
                                        className="peer placeholder:text-transparent w-full h-[54px] px-4 rounded-[10px] bg-transparent text-[16px] text-[#232323] border border-[#D9D9D9] focus:border-[#367AFF] focus:border-[1.5px] focus:outline-none [&:-webkit-autofill]:shadow-[inset_0_0_0px_1000px_#ffffff] [&:-webkit-autofill]:-webkit-text-fill-color-[#232323]" 
                                    />
                                    <label className="absolute left-3 px-1 bg-[#FFFFFF] transition-all duration-200 pointer-events-none top-4 text-[16px] text-[#9A9A9A] peer-placeholder-shown:top-4 peer-placeholder-shown:text-[16px] peer-placeholder-shown:text-[#9A9A9A] peer-focus:-top-2.5 peer-focus:text-[13px] peer-focus:text-[#367AFF] peer-focus:font-medium [&:not(:placeholder-shown)]:-top-2.5 [&:not(:placeholder-shown)]:text-[13px] [&:not(:placeholder-shown)]:font-medium">
                                        Company Name
                                    </label>
                                </div>
                            )}

                            <div className="relative w-full">
                                <input 
                                    type="password" 
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    placeholder="New Password (Leave blank to keep current)"
                                    className="peer placeholder:text-transparent w-full h-[54px] px-4 rounded-[10px] bg-transparent text-[16px] text-[#232323] border border-[#D9D9D9] focus:border-[#367AFF] focus:border-[1.5px] focus:outline-none [&:-webkit-autofill]:shadow-[inset_0_0_0px_1000px_#ffffff] [&:-webkit-autofill]:-webkit-text-fill-color-[#232323]" 
                                />
                                <label className="absolute left-3 px-1 bg-[#FFFFFF] transition-all duration-200 pointer-events-none top-4 text-[16px] text-[#9A9A9A] peer-placeholder-shown:top-4 peer-placeholder-shown:text-[16px] peer-placeholder-shown:text-[#9A9A9A] peer-focus:-top-2.5 peer-focus:text-[13px] peer-focus:text-[#367AFF] peer-focus:font-medium [&:not(:placeholder-shown)]:-top-2.5 [&:not(:placeholder-shown)]:text-[13px] [&:not(:placeholder-shown)]:font-medium">
                                    New Password <span className="text-[#969696] font-normal text-[12px] ml-1">(Leave blank to keep current)</span>
                                </label>
                            </div>

                            <div className="pt-2">
                                <button type="submit" className="w-full h-[54px] rounded-[10px] bg-[#367AFF] text-[#FFFFFF] text-[18px] font-semibold transition-colors hover:bg-[#2860cc] outline-none">
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main> 
        </div>
    );
}