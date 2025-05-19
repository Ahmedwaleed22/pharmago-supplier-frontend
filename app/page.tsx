"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/api";

function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const { login, isLoading, error } = useAuth();

  useEffect(() => {
    // If user is already authenticated, redirect to dashboard
    if (isAuthenticated()) {
      router.push("/dashboard");
    }
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate({ email, password, remember: rememberMe });
  };

  return (
    <div className="flex h-screen w-full bg-[#F4F4F4]">
      <div className="relative flex-1 hidden lg:block">
        <div className="absolute inset-0">
          <Image 
            src="/images/pharmacy-login-bg.png" 
            alt="Pharmacist" 
            fill 
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-black/75 to-transparent"></div>
        </div>
        
        <div className="absolute top-8 left-8 flex flex-col items-center">
          <div className="flex items-center gap-2">
            <Image src="/images/logo.svg" alt="PharmaGo Logo" width={24} height={24} />
            <div className="flex flex-col">
              <h1 className="text-white font-semibold text-base leading-6">PharmaGo</h1>
              <p className="text-white font-medium text-[10px] leading-4 tracking-tight">Bringing Pharmacy to Your Door</p>
            </div>
          </div>
        </div>
        
        <Image 
          src="/images/vector-with-logo.png" 
          alt="Vector"
          width={600}
          height={600}
          className="absolute inset-0 m-auto w-[100%] h-[80%] object-contain" 
        />
      </div>
      
      <div className="flex flex-col justify-center items-center flex-1 p-4">
        <div className="w-full max-w-[384px] bg-white rounded-2xl shadow-md p-6 lg:p-8">
          <div className="mb-8">
            <h1 className="text-[30px] font-semibold text-[#414651] leading-tight">Log In</h1>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {error instanceof Error ? error.message : "Login failed. Please try again."}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="flex flex-col">
              <label htmlFor="email" className="text-sm text-[#414651] mb-3 px-0.5">Email</label>
              <div className="flex items-center border-2 border-[#E4E4E7] rounded-xl shadow-sm px-3 py-2">
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-sm focus:outline-none placeholder:text-[#71717A] text-black"
                  required
                />
              </div>
            </div>
            
            <div className="flex flex-col">
              <label htmlFor="password" className="text-sm text-[#414651] mb-3 px-0.5">Password</label>
              <div className="flex items-center border-2 border-[#E4E4E7] rounded-xl shadow-sm px-3 py-2">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-sm focus:outline-none placeholder:text-[#71717A] text-black"
                  required
                />
                {/* <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="ml-2"
                >
                  <Image 
                    src={`/images/eye-icon${showPassword ? '2' : '1'}.svg`} 
                    alt={showPassword ? "Hide password" : "Show password"} 
                    width={20} 
                    height={20} 
                  />
                </button> */}
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-1">
              <div className="flex items-center">
                <div 
                  className={`h-5 w-5 rounded-md border-2 flex items-center justify-center mr-2 cursor-pointer ${
                    rememberMe ? 'bg-primary-blue border-primary-blue' : 'border-primary-blue'
                  }`}
                  onClick={() => setRememberMe(!rememberMe)}
                >
                  {rememberMe && (
                    <Image src="/images/tick.svg" alt="Checked" width={14} height={14} />
                  )}
                </div>
                <label htmlFor="remember-me" className="text-sm text-[#414651] cursor-pointer" onClick={() => setRememberMe(!rememberMe)}>
                  Remember me
                </label>
              </div>
              
              <button type="button" className="text-sm text-[#71717A] font-medium">
                Forgot password?
              </button>
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-blue text-white py-3 rounded-xl mt-4 text-sm font-medium disabled:opacity-70"
            >
              {isLoading ? "Logging in..." : "Log In"}
            </button>
          </form>
          
          <div className="mt-10 flex justify-center gap-1 text-sm">
            <span className="text-[#414651]">Need to create an account?</span>
            <Link href="/signup" className="text-primary-blue">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 

export default LoginPage;