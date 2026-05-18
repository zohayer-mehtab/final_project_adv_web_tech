"use client";
import axios from "axios";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ResetPasswordPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        token: "",
        newPassword: ""
    });
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const payload = {
            token: formData.token.trim(),
            newPassword: formData.newPassword
        };

        try {
            await axios.post("http://localhost:3000/auth/reset-password", payload);
            setSuccessMessage("Password reset successfully! Redirecting to login...");
            setError("");
            setTimeout(() => router.push("/login"), 2000);
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                const errMsg = Array.isArray(error.response.data.message) 
                    ? error.response.data.message[0] 
                    : error.response.data.message;
                setError(errMsg);
            } else {
                setError("Failed to reset password. The token might be invalid or expired.");
            }
        }
    }

    return (
        <div data-theme="light" className="min-h-screen bg-[#FFFFFF] flex flex-col items-center justify-center font-sans text-[#232323] relative">
            
            <div className="absolute top-8 left-8 md:top-8 md:left-8 flex items-center gap-3">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 2V22M6 10A6 6 0 0 1 6 22" stroke="#367AFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                <span className="text-[24px] font-semibold tracking-[-0.04em] text-[#232323]">b2b Marketplace</span>
            </div>

            <div className="w-full max-w-[400px] px-4">
                <h1 className="text-[36px] font-bold mb-2 text-center tracking-[-0.04em] text-[#232323]">New Password</h1>
                <p className="text-[#969696] text-[16px] mb-8 text-center font-normal">Enter the 6-digit code and your new password.</p>

                {error && <div className="bg-red-50 text-red-500 rounded-[10px] py-3 px-4 mb-4 text-[15px] font-medium border border-red-200">{error}</div>}
                {successMessage && <div className="bg-green-50 text-green-600 rounded-[10px] py-3 px-4 mb-4 text-[15px] font-medium border border-green-200">{successMessage}</div>}

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    
                    <div className="relative form-control w-full">
                        <input 
                            type="text" 
                            name="token"
                            id="token"
                            value={formData.token} 
                            onChange={handleInputChange} 
                            placeholder="6-Digit Token" 
                            maxLength={7}
                            className="input w-full h-[54px] px-4 peer placeholder:text-transparent border border-[#D9D9D9] focus:border-[#367AFF] focus:border-[1.5px] focus:outline-none bg-transparent text-[#232323] text-[18px] font-bold tracking-[0.3em] rounded-[10px]"
                            required
                        />
                        <label 
                            htmlFor="token" 
                            className="absolute left-3 px-1 bg-[#FFFFFF] transition-all duration-200 pointer-events-none 
                            top-4 text-[16px] text-[#9A9A9A] tracking-normal font-normal
                            peer-placeholder-shown:top-4 peer-placeholder-shown:text-[16px] peer-placeholder-shown:text-[#9A9A9A]
                            peer-focus:-top-2.5 peer-focus:text-[13px] peer-focus:text-[#367AFF] peer-focus:font-medium
                            [&:not(:placeholder-shown)]:-top-2.5 [&:not(:placeholder-shown)]:text-[13px] [&:not(:placeholder-shown)]:font-medium"
                        >
                            Reset Token
                        </label>
                    </div>

                    <div className="relative form-control w-full">
                        <input 
                            type={showPassword ? "text" : "password"} 
                            name="newPassword"
                            id="newPassword"
                            value={formData.newPassword} 
                            onChange={handleInputChange} 
                            placeholder="New Password" 
                            className="input w-full h-[54px] px-4 pr-10 peer placeholder:text-transparent border border-[#D9D9D9] focus:border-[#367AFF] focus:border-[1.5px] focus:outline-none bg-transparent text-[#232323] text-[18px] rounded-[10px]"
                            required
                        />
                        <label 
                            htmlFor="newPassword" 
                            className="absolute left-3 px-1 bg-[#FFFFFF] transition-all duration-200 pointer-events-none 
                            top-4 text-[16px] text-[#9A9A9A]
                            peer-placeholder-shown:top-4 peer-placeholder-shown:text-[16px] peer-placeholder-shown:text-[#9A9A9A]
                            peer-focus:-top-2.5 peer-focus:text-[13px] peer-focus:text-[#367AFF] peer-focus:font-medium
                            [&:not(:placeholder-shown)]:-top-2.5 [&:not(:placeholder-shown)]:text-[13px] [&:not(:placeholder-shown)]:font-medium"
                        >
                            New Password
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

                    <button type="submit" className="btn bg-[#367AFF] hover:bg-[#2860cc] text-[#FFFFFF] border-none w-full rounded-[10px] normal-case text-[18px] font-semibold h-[54px] min-h-0 mt-2 transition-colors">
                        Reset Password
                    </button>
                </form>

                <p className="text-center mt-6 text-[18px] text-[#6C6C6C]">
                    <Link href="/login" className="text-[#367AFF] font-medium hover:underline">Cancel and back to Login</Link>
                </p>
            </div>
        </div>
    );
}