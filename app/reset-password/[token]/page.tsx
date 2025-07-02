"use client";

import Link from "next/link";
import { useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useTranslation } from "@/contexts/i18n-context";
import LanguageSwitcher from "@/components/language-switcher";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

// API function for confirming password reset
async function confirmPasswordReset(token: string, password: string, confirmPassword: string) {
  const response = await axios.post("/api/reset-password-token", {
    token,
    password,
    password_confirmation: confirmPassword,
  });
  return response.data;
}

function ResetPasswordPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const { t, isRtl } = useTranslation();

  const { mutate: confirmReset, isPending } = useMutation({
    mutationFn: ({ password, confirmPassword }: { password: string; confirmPassword: string }) =>
      confirmPasswordReset(token, password, confirmPassword),
    onSuccess: () => {
      setSuccess(t("auth.passwordResetSuccessMessage") || "Your password has been reset successfully. You will be redirected to login.");
      setError("");
      // Redirect to login after a brief delay
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || t("auth.passwordResetFailedMessage") || "Failed to reset password. Please try again or request a new reset link.");
      setSuccess("");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!password || !confirmPassword) {
      setError(t("auth.passwordRequired") || "Password is required");
      setSuccess("");
      return;
    }

    if (password.length < 8) {
      setError(t("auth.passwordTooShort") || "Password must be at least 8 characters long");
      setSuccess("");
      return;
    }

    if (password !== confirmPassword) {
      setError(t("auth.passwordsDoNotMatch") || "Passwords don't match");
      setSuccess("");
      return;
    }

    confirmReset({ password, confirmPassword });
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
              {t("auth.setNewPassword") || "Set New Password"}
            </h1>
            <p className="text-sm text-[#71717A] mt-2">
              {t("auth.enterNewPasswordInstructions") || "Enter your new password to complete the reset process."}
            </p>
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

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col">
              <label
                htmlFor="password"
                className="text-sm text-[#414651] mb-3 px-0.5"
              >
                {t("auth.newPassword") || "New Password"}
              </label>
              <div className="flex items-center border-2 border-[#E4E4E7] rounded-xl shadow-sm px-3 py-2">
                <input
                  id="password"
                  type="password"
                  placeholder={t("auth.enterNewPassword") || "Enter new password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-sm focus:outline-none placeholder:text-[#71717A] text-black"
                  required
                  minLength={8}
                />
              </div>
            </div>

            <div className="flex flex-col">
              <label
                htmlFor="confirmPassword"
                className="text-sm text-[#414651] mb-3 px-0.5"
              >
                {t("auth.confirmPassword") || "Confirm Password"}
              </label>
              <div className="flex items-center border-2 border-[#E4E4E7] rounded-xl shadow-sm px-3 py-2">
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder={t("auth.confirmNewPassword") || "Confirm new password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full text-sm focus:outline-none placeholder:text-[#71717A] text-black"
                  required
                  minLength={8}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className={`w-full bg-[#007AFF] text-white py-3 rounded-xl mt-4 text-sm font-medium disabled:opacity-70 cursor-pointer ${
                isPending ? "opacity-70 cursor-not-allowed" : "hover:bg-[#0056CC]"
              }`}
            >
              {isPending ? (t("auth.updatingPassword") || "Updating password...") : (t("auth.updatePassword") || "Update Password")}
            </button>
          </form>

          <div className="mt-10 flex justify-center gap-1 text-sm">
            <span className="text-[#414651]">
              {t("auth.rememberPassword") || "Remember your password?"}
            </span>
            <Link href="/login" className="text-[#007AFF]">
              {t("auth.logIn") || "Log In"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPasswordPage; 