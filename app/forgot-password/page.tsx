"use client";

import Link from "next/link";
import { useState } from "react";
import Image from "next/image";
import { useResetPassword } from "@/hooks/use-auth";
import { useTranslation } from "@/contexts/i18n-context";
import LanguageSwitcher from "@/components/language-switcher";
import CountryCodeSelect from "@/components/ui/country-code-select";

function ForgetPasswordPage() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const { resetPassword, isPending } = useResetPassword();
  const { t, isRtl } = useTranslation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!phoneNumber) {
      setError(t("auth.phoneNumberRequired"));
      setSuccess("");
      return;
    }

    // Combine country code with phone number
    let formattedPhoneNumber = phoneNumber.replace(/\D/g, '');
    if (countryCode) {
      formattedPhoneNumber = `${countryCode}${formattedPhoneNumber}`;
    }

    resetPassword(formattedPhoneNumber, {
      onSuccess: () => {
        setSuccess(t("auth.resetPasswordSuccessMessage"));
        setError("");
      },
      onError: () => {
        setError(t("auth.resetPasswordFailedMessage"));
        setSuccess("");
      },
    });
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove all non-numeric characters
    const numericValue = e.target.value.replace(/\D/g, '');
    
    // Basic formatting - you can enhance this based on country code if needed
    let formattedValue = numericValue;
    
    // For US/Canada (+1), apply (XXX) XXX-XXXX format
    if (countryCode === "+1" && numericValue.length >= 6) {
      formattedValue = numericValue.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    } else if (numericValue.length > 0) {
      // For other countries, just add spaces every 3-4 digits for readability
      formattedValue = numericValue.replace(/(\d{3,4})/g, '$1 ').trim();
    }
    
    setPhoneNumber(formattedValue);
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

        <div
          className={`absolute top-8 ${
            isRtl ? "right-8" : "left-8"
          } flex flex-col items-center`}
        >
          <div className="flex items-center gap-2">
            <Image
              src="/images/logo.svg"
              alt="PharmaGo Logo"
              width={24}
              height={24}
            />
            <div className="flex flex-col">
              <h1 className="text-white font-semibold text-base leading-6">
                {t("brand.name")}
              </h1>
              <p className="text-white font-medium text-[10px] leading-4 tracking-tight">
                {t("brand.tagline")}
              </p>
            </div>
          </div>
        </div>

        {/* Language Switcher */}
        <div className={`absolute top-8 ${isRtl ? "left-8" : "right-8"}`}>
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
            <h1 className="text-[30px] font-semibold text-[#414651] leading-tight">
              {t("auth.resetPassword")}
            </h1>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-50 text-green-600 border border-green-200 rounded-lg text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="flex flex-col">
              <label
                htmlFor="phoneNumber"
                className="text-sm text-[#414651] mb-3 px-0.5"
              >
                {t("auth.enterPhoneNumber")}
              </label>
              <div className="flex items-center">
                <CountryCodeSelect
                  selectedCountryCode={countryCode}
                  onCountryCodeChange={setCountryCode}
                />
                <div className="flex-1 flex items-center border-2 border-l-0 border-[#E4E4E7] rounded-r-xl shadow-sm px-3 py-2">
                  <input
                    id="phoneNumber"
                    type="tel"
                    placeholder={t("auth.enterPhoneNumber")}
                    value={phoneNumber}
                    onChange={handlePhoneNumberChange}
                    className="w-full text-sm focus:outline-none placeholder:text-[#71717A] text-black"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className={`w-full bg-[#007AFF] text-white py-3 rounded-xl mt-4 text-sm font-medium disabled:opacity-70 cursor-pointer ${
                isPending ? "opacity-70 cursor-not-allowed" : "hover:bg-[#0056CC]"
              }`}
            >
              {isPending ? t("auth.sendingResetEmail") : t("auth.resetPassword")}
            </button>
          </form>

          <div className="mt-10 flex justify-center gap-1 text-sm">
            <span className="text-[#414651]">
              {t("auth.alreadyHaveAccount")}
            </span>
            <Link href="/login" className="text-[#007AFF]">
              {t("auth.logIn")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgetPasswordPage;
