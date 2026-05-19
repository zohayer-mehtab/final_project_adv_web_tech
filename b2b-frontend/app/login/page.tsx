"use client";
import axios from "axios";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await axios.post("http://localhost:3000/auth/login", formData);
            window.localStorage.setItem("token", response.data.access_token);
            setError("");

            try {
                const userResponse = await axios.get("http://localhost:3000/auth/me", {
                    headers: {
                        Authorization: `Bearer ${response.data.access_token}`, 
                    },
                });
                
                const userRole = (userResponse.data.role || "").toLowerCase();
                
                
                if (userRole === "admin") {
                    router.push("/admin/users"); 
                } else if (userRole === "vendor") {
                    router.push("/vendor/products"); 
                } else {
                    router.push("/"); 
                }
                
            } catch (userError) {
                setError("Failed to fetch user info.");
                window.localStorage.removeItem("token"); // Clean up if it fails
            }
        } catch (error: any) {
            setError(error.response?.data?.message || "Login failed.");
        }
    };

    return (
        <div data-theme="light" className="min-h-screen bg-[#FFFFFF] flex flex-col items-center justify-center font-sans text-[#232323]">
            
            <div className="absolute top-6 left-6 md:top-8 md:left-8 flex items-center gap-2">
                <Link href="/" className="p-6 flex items-center hover:opacity-80 transition-opacity">
                        <span className="text-[24px] font-bold tracking-[-0.04em] text-[#232323] flex items-center gap-1.5">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6 2V22M6 10A6 6 0 0 1 6 22" stroke="#367AFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            b2b.<span className="text-[#367AFF] font-medium">marketplace</span>
                        </span>
                    </Link>
            </div>

            <div className="w-full max-w-[400px] px-4">
                <h1 className="text-[36px] font-bold mb-2 text-center tracking-[-0.04em] text-[#232323]">Sign in</h1>
                <p className="text-[#969696] text-[16px] mb-8 text-center font-normal">Please login to continue to your account.</p>

                {error && (
                    <div className="bg-[#FEF2F2] text-[#EF4444] rounded-[10px] py-3 px-4 mb-4 text-[15px] font-medium border border-[#FCA5A5]">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    
                    <div className="relative form-control w-full">
                        <input 
                            type="email" 
                            name="email"
                            id="email"
                            value={formData.email} 
                            onChange={handleInputChange} 
                            placeholder="Email" 
                            className="input w-full h-[54px] px-4 peer placeholder:text-transparent border border-[#D9D9D9] focus:border-[#367AFF] focus:border-[1.5px] focus:outline-none bg-transparent text-[#232323] text-[16px] rounded-[10px] [&:-webkit-autofill]:shadow-[inset_0_0_0px_1000px_#ffffff] [&:-webkit-autofill]:-webkit-text-fill-color-[#232323]"
                            required
                        />
                        <label 
                            htmlFor="email" 
                            className="absolute left-3 px-1 bg-[#FFFFFF] transition-all duration-200 pointer-events-none 
                            top-4 text-[16px] text-[#9A9A9A]
                            peer-placeholder-shown:top-4 peer-placeholder-shown:text-[16px] peer-placeholder-shown:text-[#9A9A9A]
                            peer-focus:-top-2.5 peer-focus:text-[13px] peer-focus:text-[#367AFF] peer-focus:font-medium
                            [&:not(:placeholder-shown)]:-top-2.5 [&:not(:placeholder-shown)]:text-[13px] [&:not(:placeholder-shown)]:font-medium"
                        >
                            Email
                        </label>
                    </div>

                    <div className="relative form-control w-full">
                        <input 
                            type={showPassword ? "text" : "password"} 
                            name="password"
                            id="password"
                            value={formData.password} 
                            onChange={handleInputChange} 
                            placeholder="Password" 
                            className="input w-full h-[54px] px-4 pr-10 peer placeholder:text-transparent border border-[#D9D9D9] focus:border-[#367AFF] focus:border-[1.5px] focus:outline-none bg-transparent text-[#232323] text-[16px] rounded-[10px] [&:-webkit-autofill]:shadow-[inset_0_0_0px_1000px_#ffffff] [&:-webkit-autofill]:-webkit-text-fill-color-[#232323]"
                            required
                        />
                        <label 
                            htmlFor="password" 
                            className="absolute left-3 px-1 bg-[#FFFFFF] transition-all duration-200 pointer-events-none 
                            top-4 text-[16px] text-[#9A9A9A]
                            peer-placeholder-shown:top-4 peer-placeholder-shown:text-[16px] peer-placeholder-shown:text-[#9A9A9A]
                            peer-focus:-top-2.5 peer-focus:text-[13px] peer-focus:text-[#367AFF] peer-focus:font-medium
                            [&:not(:placeholder-shown)]:-top-2.5 [&:not(:placeholder-shown)]:text-[13px] [&:not(:placeholder-shown)]:font-medium"
                        >
                            Password
                        </label>
                        <button 
                            type="button" 
                            className="absolute inset-y-0 right-4 flex items-center text-[#9A9A9A] hover:text-[#232323] transition-colors z-10"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                </svg>
                            )}
                        </button>
                    </div>

                    <button type="submit" className="w-full h-[54px] rounded-[10px] bg-[#367AFF] text-[#FFFFFF] text-[18px] font-semibold transition-colors hover:bg-[#2860cc] border-none mt-2">
                        Sign in
                    </button>
                </form>

                <p className="text-center mt-6 text-[16px] text-[#6C6C6C]">
                    Need an account? <Link href="/register" className="text-[#367AFF] font-medium hover:underline ml-1">Create one</Link>
                </p>
                <p className="text-center mt-3 text-[16px] text-[#6C6C6C]">
                    <Link href="/forgot-password" className="text-[#367AFF] font-medium hover:underline ml-1">Forgot your password?</Link>
                </p>
            </div>
        </div>
    );
}