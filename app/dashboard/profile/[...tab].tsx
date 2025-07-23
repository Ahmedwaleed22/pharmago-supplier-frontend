"use client";

import React, { useEffect, useState, useRef } from "react";
import { CameraIcon, UserIcon, BuildingIcon, PlusIcon, EditIcon, TrashIcon, MapPinIcon, PhoneIcon } from "lucide-react";
import Breadcrumb from "@/components/ui/breadcrumb";
import { useTranslation } from "@/contexts/i18n-context";
import CustomButton from "@/components/custom-button";
import { useSelector } from "react-redux";
import { getPharmacy, getUser } from "@/store/authSlice";
import Image from "next/image";
import LanguageSwitcher from "@/components/language-switcher";
import {
  getPharmacyProfile,
  updatePharmacyProfile,
  validateProfileFiles,
  getPharmacyBranches,
  deletePharmacyBranch,
} from "@/services/pharmacy-profile";
import { useRouter } from "next/navigation";

interface FormData {
  // User fields
  name: string;
  email: string;
  phone_number: string;
  password: string;
  password_confirmation: string;
  
  // Pharmacy fields
  pharmacy_name: string;
  pharmacy_description: string;
  country_id: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone_number?: string;
  password?: string;
  password_confirmation?: string;
  pharmacy_name?: string;
  pharmacy_description?: string;
  country_id?: string;
  logo?: string;
  avatar?: string;
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
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'profile' | 'pharmacy' | 'branches'>('profile');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = useState("");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<Auth.ProfileResponse | null>(null);
  const [branches, setBranches] = useState<Auth.PharmacyBranch[]>([]);
  const [isBranchesLoading, setIsBranchesLoading] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    // User fields
    name: "",
    email: "",
    phone_number: "",
    password: "",
    password_confirmation: "",
    
    // Pharmacy fields
    pharmacy_name: "",
    pharmacy_description: "",
    country_id: "",
  });

  const [files, setFiles] = useState<{
    logo?: File;
    avatar?: File;
  }>({});

  // Load profile data on component mount
  useEffect(() => {
    loadProfileData();
  }, []);

  // Load branches when branches tab is active
  useEffect(() => {
    if (activeTab === 'branches' && branches.length === 0) {
      loadBranches();
    }
  }, [activeTab]);

  const loadProfileData = async () => {
    try {
      setIsLoading(true);
      const data = await getPharmacyProfile();
      setProfileData(data);
      
      // Populate form with existing data
      setFormData({
        // User fields
        name: data.data.user.name || "",
        email: data.data.user.email || "",
        phone_number: data.data.user.phone_number || "",
        password: "",
        password_confirmation: "",
        
        // Pharmacy fields
        pharmacy_name: data.data.pharmacy.name || "",
        pharmacy_description: data.data.pharmacy.description || "",
        country_id: data.data.pharmacy.country_id?.toString() || "",
      });
    } catch (error: any) {
      console.error("Error loading profile data:", error);
      if (error.response?.data) {
        console.error("Error details:", error.response.data);
      }
      setErrors({
        general: error.response?.data?.message || error.message || "Failed to load profile data"
      });
      
      // Fallback to Redux data if API fails
      if (user) {
        setFormData(prevData => ({
          ...prevData,
          name: user.name || "",
          email: user.email || "",
          phone_number: user.phone_number || user.phone || "",
        }));
      }
      if (pharmacy) {
        setFormData(prevData => ({
          ...prevData,
          pharmacy_name: pharmacy.name || "",
          pharmacy_description: pharmacy.description || "",
          country_id: pharmacy.country_id?.toString() || "",
        }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadBranches = async () => {
    try {
      setIsBranchesLoading(true);
      const branchData = await getPharmacyBranches();
      setBranches(branchData);
    } catch (error: any) {
      console.error("Error loading branches:", error);
      setErrors({
        general: error.message || "Failed to load branches"
      });
    } finally {
      setIsBranchesLoading(false);
    }
  };

  const handleAddBranch = () => {
    router.push("/dashboard/branches/add");
  };

  const handleEditBranch = (branchId: string) => {
    router.push(`/dashboard/branches/edit/${branchId}`);
  };

  const handleDeleteBranch = async (branchId: string, branchName: string) => {
    if (!confirm(t("branches.confirmDelete").replace("{name}", branchName))) {
      return;
    }

    try {
      await deletePharmacyBranch(branchId);
      // Reload branches after deletion
      await loadBranches();
    } catch (error: any) {
      console.error("Error deleting branch:", error);
      setErrors({
        general: error.message || "Failed to delete branch"
      });
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear specific field error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleFileUpload = (type: 'avatar' | 'logo') => {
    if (type === 'avatar') {
      fileInputRef.current?.click();
    } else {
      logoInputRef.current?.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'logo') => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file using service function
      const validationErrors = validateProfileFiles({ [type]: file });
      if (validationErrors.length > 0) {
        setErrors((prev) => ({
          ...prev,
          [type]: validationErrors[0],
        }));
        return;
      }

      setFiles((prev) => ({
        ...prev,
        [type]: file,
      }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          if (type === 'avatar') {
            setAvatarPreview(e.target.result as string);
          } else {
            setLogoPreview(e.target.result as string);
          }
        }
      };
      reader.onerror = () => {
        setErrors((prev) => ({
          ...prev,
          [type]: t("profile.imageReadError") || "Error reading image file",
        }));
      };
      reader.readAsDataURL(file);

      // Clear previous errors
      setErrors((prev) => ({
        ...prev,
        [type]: undefined,
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate user fields
    if (!formData.name.trim()) {
      newErrors.name = t("profile.nameRequired");
    }

    if (!formData.email.trim()) {
      newErrors.email = t("profile.emailRequired");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t("profile.invalidEmail");
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

    // Validate pharmacy fields
    if (formData.pharmacy_name && !formData.pharmacy_name.trim()) {
      newErrors.pharmacy_name = t("profile.pharmacyNameRequired");
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
      // Prepare profile update data using modern nested format
      const profileUpdateData: Auth.ProfileUpdateData = {
        name: formData.name,
        email: formData.email,
        phone_number: formData.phone_number || undefined,
        password: formData.password || undefined,
        avatar: files.avatar,
        pharmacy: {
          name: formData.pharmacy_name || undefined,
          description: formData.pharmacy_description || undefined,
          country_id: formData.country_id || undefined,
          logo: files.logo,
        },
      };

      // Remove empty nested objects
      if (!Object.values(profileUpdateData.pharmacy!).some(v => v !== undefined)) {
        delete profileUpdateData.pharmacy;
      }

      const result = await updatePharmacyProfile(profileUpdateData);

      // Success
      setSuccessMessage(t("profile.profileUpdatedSuccess"));

      // Clear password fields after successful update
      setFormData((prev) => ({
        ...prev,
        password: "",
        password_confirmation: "",
      }));

      // Clear file selections and previews
      setFiles({});
      setLogoPreview(null);
      setAvatarPreview(null);

      // Reset file inputs
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      if (logoInputRef.current) {
        logoInputRef.current.value = "";
      }

      // Reload profile data
      await loadProfileData();
    } catch (error: any) {
      console.error("Error updating profile:", error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({
          general: error.response?.data?.message || t("profile.updateError"),
        });
      }
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

      {/* Tab Navigation */}
      <div className="mt-8 bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-8 pt-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('profile')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm cursor-pointer ${
                activeTab === 'profile'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <UserIcon className="w-4 h-4" />
                <span>{t("profile.userProfile")}</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('pharmacy')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm cursor-pointer ${
                activeTab === 'pharmacy'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <BuildingIcon className="w-4 h-4" />
                <span>{t("profile.pharmacyInfo")}</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('branches')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm cursor-pointer ${
                activeTab === 'branches'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <BuildingIcon className="w-4 h-4" />
                <span>{t("profile.branches")}</span>
              </div>
            </button>
          </nav>
        </div>

        <div className="p-8">
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

          {/* Hidden file inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e, 'avatar')}
            className="hidden"
          />
          <input
            ref={logoInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e, 'logo')}
            className="hidden"
          />

          {/* Tab Content */}
          {activeTab === 'profile' && (
            <div>
              {/* User Profile Avatar Section */}
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center border-4 border-white shadow-sm overflow-hidden">
                    {avatarPreview ? (
                      <Image
                        src={avatarPreview}
                        alt={t("profile.avatarPreview")}
                        className="w-full h-full object-cover rounded-full"
                        width={96}
                        height={96}
                      />
                    ) : profileData?.data?.user?.avatar ? (
                      <Image
                        src={profileData.data.user.avatar}
                        alt={t("profile.userAvatar")}
                        className="w-full h-full object-cover rounded-full"
                        width={96}
                        height={96}
                        unoptimized={true}
                        onError={(e) => {
                          console.warn('Failed to load user avatar:', profileData.data.user.avatar);
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {formData.name?.charAt(0) || user?.name?.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  <CustomButton
                    onClick={() => handleFileUpload('avatar')}
                    disabled={isUploading}
                    className="absolute bottom-0 right-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-blue-600 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <CameraIcon className="w-4 h-4" />
                  </CustomButton>
                </div>
              </div>

              {/* Avatar Error */}
              {errors.avatar && (
                <div className="text-center mb-4">
                  <p className="text-red-500 text-sm">{errors.avatar}</p>
                </div>
              )}

              <div className="text-center mb-8">
                <h2 className="text-xl font-semibold text-blue-gray">
                  {formData.name || user?.name}
                </h2>
                <p className="text-sm text-gray-600">{t("profile.pharmacyAdmin")}</p>
              </div>

              {/* User Information Fields */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("profile.fullName")}
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                        errors.name ? "border-red-500" : "border-gray-200"
                      }`}
                      placeholder={t("profile.enterFullName")}
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
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                        errors.email ? "border-red-500" : "border-gray-200"
                      }`}
                      placeholder={t("profile.enterEmailAddress")}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("profile.phoneNumber")}
                  </label>
                  <input
                    type="tel"
                    value={formData.phone_number}
                    onChange={(e) => handleInputChange("phone_number", e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                      errors.phone_number ? "border-red-500" : "border-gray-200"
                    }`}
                    placeholder={t("profile.enterPhoneNumber")}
                  />
                  {errors.phone_number && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone_number}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("profile.newPassword")}
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
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
                      {t("profile.confirmPassword")}
                    </label>
                    <input
                      type="password"
                      value={formData.password_confirmation}
                      onChange={(e) => handleInputChange("password_confirmation", e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                        errors.password_confirmation ? "border-red-500" : "border-gray-200"
                      }`}
                      placeholder={t("profile.confirmNewPassword")}
                    />
                    {errors.password_confirmation && (
                      <p className="text-red-500 text-sm mt-1">{errors.password_confirmation}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pharmacy' && (
            <div>
              {/* Pharmacy Logo Section */}
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center border-4 border-white shadow-sm overflow-hidden">
                    {logoPreview ? (
                      <Image
                        src={logoPreview}
                        alt={t("profile.logoPreview")}
                        className="w-full h-full object-cover"
                        width={96}
                        height={96}
                      />
                    ) : profileData?.data?.pharmacy?.logo ? (
                      <Image
                        src={profileData.data.pharmacy.logo}
                        alt={t("profile.pharmacyLogo")}
                        className="w-full h-full object-cover rounded-full"
                        width={96}
                        height={96}
                        unoptimized={true}
                        onError={(e) => {
                          console.warn('Failed to load pharmacy logo:', profileData.data.pharmacy.logo);
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <BuildingIcon className="w-12 h-12 text-gray-400" />
                    )}
                  </div>
                  <CustomButton
                    onClick={() => handleFileUpload('logo')}
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
                  {formData.pharmacy_name || pharmacy?.name || t("profile.pharmacyName")}
                </h2>
                <p className="text-sm text-gray-600">{t("profile.pharmacyInformation")}</p>
              </div>

              {/* Pharmacy Information Fields */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("profile.pharmacyName")}
                  </label>
                  <input
                    type="text"
                    value={formData.pharmacy_name}
                    onChange={(e) => handleInputChange("pharmacy_name", e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                      errors.pharmacy_name ? "border-red-500" : "border-gray-200"
                    }`}
                    placeholder={t("profile.enterPharmacyName")}
                  />
                  {errors.pharmacy_name && (
                    <p className="text-red-500 text-sm mt-1">{errors.pharmacy_name}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'branches' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-blue-gray mb-2">
                    {t("branches.title")}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t("branches.description")}
                  </p>
                </div>
              </div>

              {isBranchesLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4 border animate-pulse">
                      <div className="flex justify-between items-start mb-4">
                        <div className="h-6 bg-gray-200 rounded w-48"></div>
                        <div className="flex space-x-2">
                          <div className="h-8 bg-gray-200 rounded w-16"></div>
                          <div className="h-8 bg-gray-200 rounded w-16"></div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : branches.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPinIcon className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {t("branches.noBranches")}
                  </h3>
                  <p className="text-gray-500 mb-6">
                    {t("branches.noBranchesDescription")}
                  </p>
                  <CustomButton
                    onClick={handleAddBranch}
                    className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors inline-flex items-center space-x-2"
                  >
                    <PlusIcon className="w-5 h-5" />
                    <span>{t("branches.addFirstBranch")}</span>
                  </CustomButton>
                </div>
              ) : (
                <div className="space-y-4">
                  {branches.map((branch) => (
                    <div key={branch.id} className="bg-gray-50 rounded-lg p-4 border">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-medium text-blue-gray mb-1">
                            {branch.name}
                          </h4>
                          <div className="flex items-center text-gray-600 text-sm mb-2">
                            <MapPinIcon className="w-4 h-4 mr-1" />
                            <span>{branch.address}</span>
                          </div>
                          {branch.phone_number && (
                            <div className="flex items-center text-gray-600 text-sm">
                              <PhoneIcon className="w-4 h-4 mr-1" />
                              <span>{branch.phone_number}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <CustomButton
                            onClick={() => handleEditBranch(branch.id)}
                            className="bg-blue-500 text-white px-4 py-2 text-sm font-medium hover:bg-blue-600 rounded-lg transition-colors flex items-center space-x-2"
                          >
                            <EditIcon className="w-4 h-4" />
                            <span>{t("common.edit")}</span>
                          </CustomButton>
                        </div>
                      </div>
                      
                      {(branch.latitude && branch.longitude) && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="text-sm text-gray-600">
                            <strong>{t("branches.coordinates")}:</strong>{" "}
                            {parseFloat(branch.latitude.toString()).toFixed(6)}, {parseFloat(branch.longitude.toString()).toFixed(6)}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Save Button - only show for profile and pharmacy tabs */}
          {activeTab !== 'branches' && (
          <div className="flex justify-start mt-8">
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
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;