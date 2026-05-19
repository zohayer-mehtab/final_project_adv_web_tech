"use client";
import axios from "axios";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            await axios.post("http://localhost:3000/auth/forgot-password", { email });
            
            setSuccessMessage("A 6-digit reset code has been sent to your email!");
            setError("");
            
            setTimeout(() => router.push("/reset-password"), 2000);
            
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                setError(error.response.data.message);
            } else {
                setError("Failed to send reset email.");
            }
        }
    }

    return (
        <div data-theme="light" className="min-h-screen bg-[#FFFFFF] flex flex-col items-center justify-center font-sans text-[#232323] relative">
            
            <div className="absolute top-8 left-8 md:top-8 md:left-8 flex items-center gap-3">
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
                <h1 className="text-[40px] font-bold mb-2 text-center tracking-[-0.04em] text-[#232323]">Forgot Password</h1>
                <p className="text-[#969696] text-[18px] mb-8 text-center font-normal">Enter your email to receive a reset code.</p>

                {error && <div className="bg-red-50 text-red-500 rounded-[10px] py-3 px-4 mb-4 text-[15px] font-medium border border-red-200">{error}</div>}
                {successMessage && <div className="bg-green-50 text-green-600 rounded-[10px] py-3 px-4 mb-4 text-[15px] font-medium border border-green-200">{successMessage}</div>}

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    
                    <div className="relative form-control w-full">
                        <input 
                            type="email" 
                            name="email"
                            id="email"
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
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

                    <button type="submit" className="btn bg-[#367AFF] hover:bg-[#2860cc] text-[#FFFFFF] border-none w-full rounded-[10px] normal-case text-[18px] font-semibold h-[54px] min-h-0 mt-2 transition-colors">
                        Send Code
                    </button>
                </form>

                <p className="text-center mt-6 text-[18px] text-[#6C6C6C]">
                    Remembered your password? <Link href="/login" className="text-[#367AFF] font-medium hover:underline ml-1">Sign in</Link>
                </p>
            </div>
        </div>
    );
}