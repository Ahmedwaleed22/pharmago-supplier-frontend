"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@/hooks/use-auth";
import { isAuthenticated } from "@/lib/api";
import { useTranslation } from "@/contexts/i18n-context";
import LanguageSwitcher from "@/components/language-switcher";
import { rememberMeUtils } from "@/lib/remember-me";
import { useRouter } from "next/navigation";

function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isFormReady, setIsFormReady] = useState(false);
  
  const { login, isLoading, error } = useAuth();
  const { t, isRtl } = useTranslation();

  // Load stored credentials on component mount
  useEffect(() => {
    // If user is already authenticated, redirect to dashboard
    if (isAuthenticated()) {
      window.location.href = "/dashboard";
    }

    // Load stored credentials if they exist
    const storedCredentials = rememberMeUtils.getStoredCredentials();
    if (storedCredentials) {
      setEmail(storedCredentials.email || "");
      setPassword(storedCredentials.password || "");
      setRememberMe(true); // Only set to true if credentials were actually stored
    } else {
      // If no full credentials, try to load just the email (but don't auto-check remember me)
      const storedEmail = rememberMeUtils.getStoredEmail();
      if (storedEmail) {
        setEmail(storedEmail);
        // Don't automatically set rememberMe to true for just email
      }
    }
    setIsFormReady(true);
  }, [router]);

  // Handle remember me toggle
  const handleRememberMeChange = (checked: boolean) => {
    setRememberMe(checked);
    
    // If unchecked, clear stored credentials
    if (!checked) {
      rememberMeUtils.clearStoredCredentials();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Store credentials if remember me is checked
    if (rememberMe) {
      rememberMeUtils.storeCredentials(email, password);
    } else {
      // Clear credentials if remember me is unchecked
      rememberMeUtils.clearStoredCredentials();
    }
    
    login.mutate({ email, password, remember: rememberMe }, {
      onSuccess: () => {
        window.location.href = "/dashboard";
      }
    });
  };

  // Clear specific credential when user starts typing new values
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    
    // If user changes email and remember me is on, update stored credentials
    if (rememberMe && rememberMeUtils.hasStoredCredentials()) {
      rememberMeUtils.updateStoredCredentials(newEmail, password);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    
    // If user changes password and remember me is on, update stored credentials
    if (rememberMe && rememberMeUtils.hasStoredCredentials()) {
      rememberMeUtils.updateStoredCredentials(email, newPassword);
    }
  };

  // Show loading state while checking for stored credentials
  if (!isFormReady) {
    return (
      <div className="flex h-screen w-full bg-[#F4F4F4] items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-blue mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

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
        
        <div className={`absolute top-8 ${isRtl ? 'right-8' : 'left-8'} flex flex-col items-center`}>
          <div className="flex items-center gap-2">
            <Image src="/images/logo.svg" alt="PharmaGo Logo" width={24} height={24} />
            <div className="flex flex-col">
              <h1 className="text-white font-semibold text-base leading-6">{t('brand.name')}</h1>
              <p className="text-white font-medium text-[10px] leading-4 tracking-tight">{t('brand.tagline')}</p>
            </div>
          </div>
        </div>
        
        {/* Language Switcher */}
        <div className={`absolute top-8 ${isRtl ? 'left-8' : 'right-8'}`}>
          <LanguageSwitcher />
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
            <h1 className="text-[30px] font-semibold text-[#414651] leading-tight">{t('auth.login')}</h1>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="flex flex-col">
              <label htmlFor="email" className="text-sm text-[#414651] mb-3 px-0.5">{t('auth.email')}</label>
              <div className="flex items-center border-2 border-[#E4E4E7] rounded-xl shadow-sm px-3 py-2">
                <input
                  id="email"
                  type="email"
                  placeholder={t('auth.enterEmail')}
                  value={email}
                  onChange={handleEmailChange}
                  className="w-full text-sm focus:outline-none placeholder:text-[#71717A] text-black"
                  required
                />
              </div>
            </div>
            
            <div className="flex flex-col">
              <label htmlFor="password" className="text-sm text-[#414651] mb-3 px-0.5">{t('auth.password')}</label>
              <div className="flex items-center border-2 border-[#E4E4E7] rounded-xl shadow-sm px-3 py-2">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t('auth.enterPassword')}
                  value={password}
                  onChange={handlePasswordChange}
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
                    alt={showPassword ? t('auth.hidePassword') : t('auth.showPassword')} 
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
                  onClick={() => handleRememberMeChange(!rememberMe)}
                >
                  {rememberMe && (
                    <Image src="/images/tick.svg" alt="Checked" width={14} height={14} />
                  )}
                </div>
                <label htmlFor="remember-me" className="text-sm text-[#414651] cursor-pointer" onClick={() => handleRememberMeChange(!rememberMe)}>
                  {t('auth.rememberMe')}
                </label>
              </div>
              
              <button type="button" className="text-sm text-[#71717A] font-medium">
                {t('auth.forgotPassword')}
              </button>
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-primary-blue text-white py-3 rounded-xl mt-4 text-sm font-medium disabled:opacity-70 cursor-pointer ${isLoading ? 'opacity-70 cursor-not-allowed' : 'isLoading'}`}
            >
              {isLoading ? t('auth.loggingIn') : t('auth.login')}
            </button>
          </form>
          
          <div className="mt-10 flex justify-center gap-1 text-sm">
            <span className="text-[#414651]">{t('auth.needAccount')}</span>
            <Link href="/signup" className="text-primary-blue">
              {t('auth.signUp')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 

export default LoginPage;