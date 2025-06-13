"use client";

import React, { useEffect, useState, useRef } from "react";
import { CameraIcon } from "lucide-react";
import Breadcrumb from "@/components/ui/breadcrumb";
import { useTranslation } from "@/contexts/i18n-context";
import CustomButton from "@/components/custom-button";
import { useSelector } from "react-redux";
import { getPharmacy, getUser } from "@/store/authSlice";
import Image from "next/image";
import LanguageSwitcher from "@/components/language-switcher";

interface FormData {
  name: string;
  email: string;
  address: string;
  password: string;
  password_confirmation: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  address?: string;
  password?: string;
  password_confirmation?: string;
  logo?: string;
  general?: string;
}

// Skeleton Components
const SkeletonAvatar = () => (
  <div className="flex justify-center mb-8">
    <div className="relative">
      <div className="w-24 h-24 bg-gray-200 rounded-full animate-pulse border-4 border-white shadow-sm"></div>
      <div className="absolute bottom-0 right-0 w-8 h-8 bg-gray-300 rounded-full animate-pulse"></div>
    </div>
  </div>
);

const SkeletonUserInfo = () => (
  <div className="text-center mb-8">
    <div className="h-6 bg-gray-200 rounded-md w-48 mx-auto mb-2 animate-pulse"></div>
    <div className="h-4 bg-gray-200 rounded-md w-32 mx-auto animate-pulse"></div>
  </div>
);

const SkeletonInput = () => (
  <div>
    <div className="h-4 bg-gray-200 rounded w-24 mb-2 animate-pulse"></div>
    <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
  </div>
);

const SkeletonSection = ({
  title,
  inputs,
}: {
  title: string;
  inputs: number;
}) => (
  <div className="mb-8">
    <div className="h-6 bg-gray-200 rounded w-40 mb-6 animate-pulse"></div>
    <div
      className={`grid grid-cols-1 ${
        inputs > 1 ? "md:grid-cols-2" : ""
      } gap-6 ${inputs === 3 ? "mb-6" : ""}`}
    >
      {Array.from({ length: Math.min(inputs, 2) }).map((_, i) => (
        <SkeletonInput key={i} />
      ))}
    </div>
    {inputs === 3 && <SkeletonInput />}
  </div>
);

const SkeletonButton = () => (
  <div className="flex justify-start">
    <div className="h-12 bg-gray-200 rounded-lg w-24 animate-pulse"></div>
  </div>
);

const ProfileSkeleton = () => (
  <div className="py-8 text-blue-gray">
    <Breadcrumb
      items={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Profile", href: "/dashboard/profile" },
      ]}
    />

    <div className="mt-1">
      <div className="h-8 bg-gray-200 rounded w-24 animate-pulse"></div>
    </div>

    <div className="mt-8 w-full bg-white rounded-lg p-8 shadow-md">
      <SkeletonAvatar />
      <SkeletonUserInfo />
      <SkeletonSection title="General Information" inputs={3} />
      <SkeletonSection title="Account Information" inputs={2} />
      <SkeletonButton />
    </div>
  </div>
);

function ProfilePage() {
  const { t, isRtl } = useTranslation();
  const user = useSelector(getUser);
  const pharmacy = useSelector(getPharmacy);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = useState("");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    address: "",
    password: "",
    password_confirmation: "",
  });

  const [files, setFiles] = useState<{
    logo?: File;
  }>({});

  useEffect(() => {
    // Simulate loading time and wait for user data
    const timer = setTimeout(() => {
      if (user) {
        setFormData({
          name: user?.name || "",
          email: user?.email || "",
          address: user?.address || "",
          password: "",
          password_confirmation: "",
        });
        setIsLoading(false);
      }
    }, 500);

    // If user data is already available, set loading to false immediately
    if (user) {
      setFormData({
        name: user?.name || "",
        email: user?.email || "",
        address: user?.address || "",
        password: "",
        password_confirmation: "",
      });
      setIsLoading(false);
      clearTimeout(timer);
    }

    return () => clearTimeout(timer);
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear specific field error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({
          ...prev,
          logo: t("profile.selectValidImage"),
        }));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          logo: t("profile.imageSizeLimit"),
        }));
        return;
      }

      setFiles((prev) => ({
        ...prev,
        logo: file,
      }));

      // Create preview immediately
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setLogoPreview(e.target.result as string);
        }
      };
      reader.onerror = () => {
        setErrors((prev) => ({
          ...prev,
          logo: t("profile.imageReadError") || "Error reading image file",
        }));
      };
      reader.readAsDataURL(file);

      // Clear any previous logo errors
      setErrors((prev) => ({
        ...prev,
        logo: undefined,
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate required fields
    if (!formData.name.trim()) {
      newErrors.name = t("profile.nameRequired");
    }

    if (!formData.email.trim()) {
      newErrors.email = t("profile.emailRequired");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t("profile.invalidEmail");
    }

    if (!formData.address.trim()) {
      newErrors.address = t("profile.addressRequired");
    }

    // Validate password if provided
    if (formData.password) {
      if (formData.password.length < 8) {
        newErrors.password = t("profile.passwordMinLength");
      }

      if (formData.password !== formData.password_confirmation) {
        newErrors.password_confirmation = t("profile.passwordsDoNotMatch");
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    setSuccessMessage("");
    setErrors({});

    if (!validateForm()) {
      return;
    }

    setIsSaving(true);

    try {
      const apiUrl = "/api/user";

      // Create FormData for file upload
      const submitData = new FormData();

      // Add text fields
      submitData.append("name", formData.name);
      submitData.append("email", formData.email);
      if (formData.address) {
        submitData.append("address", formData.address);
      }

      // Add password fields only if password is provided
      if (formData.password) {
        submitData.append("password", formData.password);
        submitData.append(
          "password_confirmation",
          formData.password_confirmation
        );
      }

      // Add files
      if (files.logo) {
        submitData.append("logo", files.logo);
      }

      const response = await fetch(apiUrl, {
        method: "POST",
        body: submitData,
        headers: {
          // Don't set Content-Type for FormData, let browser set it
          Accept: "application/json",
        },
      });

      const result = await response.json();

      if (!response.ok) {
        // Handle validation errors from server
        if (result.errors) {
          setErrors(result.errors);
        } else {
          setErrors({
            general: result.message || t("profile.updateError"),
          });
        }
        return;
      }

      // Success
      setSuccessMessage(t("profile.profileUpdatedSuccess"));

      // Clear password fields after successful update
      setFormData((prev) => ({
        ...prev,
        password: "",
        password_confirmation: "",
      }));

      // Clear file selections
      setFiles({});
      setLogoPreview(null);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setErrors({
        general: t("profile.networkError"),
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Show skeleton loading while data is being loaded
  if (isLoading) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="py-8 text-blue-gray relative">
      <Breadcrumb
        items={[
          { label: t("breadcrumbs.dashboard"), href: "/dashboard" },
          { label: t("breadcrumbs.profile"), href: "/dashboard/profile" },
        ]}
      />

      <div className="mt-1">
        <h1 className="text-2xl font-bold text-blue-gray">{t("profile.title")}</h1>
      </div>

      <div className="mt-8 w-full bg-white rounded-lg p-8 shadow-md relative">
        <div className={`absolute top-3 ${isRtl ? "left-3" : "right-3"} z-10`}>
          <LanguageSwitcher />
        </div>
        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {successMessage}
          </div>
        )}

        {/* General Error Message */}
        {errors.general && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {errors.general}
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Profile Logo Section */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center border-4 border-white shadow-sm overflow-hidden">
              {logoPreview ? (
                <Image
                  src={logoPreview}
                  alt={t("profile.logoPreview")}
                  className="w-full h-full object-cover rounded-full"
                  width={96}
                  height={96}
                />
              ) : pharmacy?.logo ? (
                <Image
                  src={pharmacy.logo}
                  alt={t("profile.pharmacyLogo")}
                  className="w-full h-full object-cover rounded-full"
                  width={96}
                  height={96}
                  unoptimized={true}
                  onError={(e) => {
                    console.warn('Failed to load pharmacy logo:', pharmacy.logo);
                    // Hide the image on error and show fallback
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {user?.name?.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            <CustomButton
              onClick={handleFileUpload}
              disabled={isUploading}
              className="absolute bottom-0 right-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-blue-600 transition-colors cursor-pointer disabled:opacity-50"
            >
              <CameraIcon className="w-4 h-4" />
            </CustomButton>
          </div>
        </div>

        {/* Logo Error */}
        {errors.logo && (
          <div className="text-center mb-4">
            <p className="text-red-500 text-sm">{errors.logo}</p>
          </div>
        )}

        <div className="text-center mb-8">
          <h2 className="text-xl font-semibold text-blue-gray">
            {formData.name}
          </h2>
          <p className="text-sm text-gray-600">{t("profile.pharmacyAdmin")}</p>
        </div>

        {/* General Information Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-blue-gray mb-6">
            {t("profile.generalInformation")}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("profile.pharmacyName")}
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white ${
                  errors.name ? "border-red-500" : "border-gray-200"
                }`}
                placeholder={t("profile.enterPharmacyName")}
                required
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("profile.emailAddress")}
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white ${
                  errors.email ? "border-red-500" : "border-gray-200"
                }`}
                placeholder={t("profile.enterEmailAddress")}
                required
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("profile.fullAddress")}
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white ${
                errors.address ? "border-red-500" : "border-gray-200"
              }`}
              placeholder={t("profile.enterFullAddress")}
              required
            />
            {errors.address && (
              <p className="text-red-500 text-sm mt-1">{errors.address}</p>
            )}
          </div>
        </div>

        {/* Account Information Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-blue-gray">
            {t("profile.accountInformation")}
          </h3>
          <p className="text-sm text-muted-gray mb-4">
            {t("profile.passwordFieldsNote")}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("profile.newPassword")}
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white ${
                  errors.password ? "border-red-500" : "border-gray-200"
                }`}
                placeholder={t("profile.enterNewPassword")}
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("profile.confirmNewPassword")}
              </label>
              <input
                type="password"
                value={formData.password_confirmation}
                onChange={(e) =>
                  handleInputChange("password_confirmation", e.target.value)
                }
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white ${
                  errors.password_confirmation
                    ? "border-red-500"
                    : "border-gray-200"
                }`}
                placeholder={t("profile.confirmNewPasswordPlaceholder")}
              />
              {errors.password_confirmation && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password_confirmation}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-start">
          <CustomButton
            onClick={handleSave}
            disabled={isSaving}
            className={`px-8 py-4 h-10 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              isSaving ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isSaving ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>{t("profile.saving")}</span>
              </div>
            ) : (
              t("common.save")
            )}
          </CustomButton>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
