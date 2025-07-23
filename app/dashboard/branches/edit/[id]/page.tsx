"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useTranslation } from "@/contexts/i18n-context";
import CustomButton from "@/components/custom-button";
import Breadcrumb from "@/components/ui/breadcrumb";
import GoogleMapPicker from "@/components/google-map-picker";
import CountryCodeSelect from "@/components/ui/country-code-select";
import {
  getPharmacyBranches,
  updatePharmacyBranch,
} from "@/services/pharmacy-profile";
import DashboardLayoutWithBreadcrumb from "@/layouts/dashboard-with-breadcrumbs-layout";

interface FormData {
  name: string;
  address: string;
  latitude: string;
  longitude: string;
  phone_number: string;
}

interface FormErrors {
  name?: string;
  address?: string;
  latitude?: string;
  longitude?: string;
  phone_number?: string;
  general?: string;
}

const EditBranchPage: React.FC = () => {
  const { t, isRtl } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const branchId = params.id as string;

  const [formData, setFormData] = useState<FormData>({
    name: "",
    address: "",
    latitude: "",
    longitude: "",
    phone_number: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countryCode, setCountryCode] = useState("");
  const [originalBranch, setOriginalBranch] = useState<Auth.PharmacyBranch | null>(null);

  // Map picker state
  const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);
  const [selectedLocationData, setSelectedLocationData] = useState<{
    name: string;
    lat: number;
    lng: number;
    address: string;
  } | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Load branch data on component mount
  useEffect(() => {
    loadBranchData();
  }, [branchId]);

  const loadBranchData = async () => {
    try {
      setIsLoading(true);
      const branches = await getPharmacyBranches();
      const branch = branches.find(b => b.id === branchId);
      
      if (!branch) {
        router.push("/dashboard/profile");
        return;
      }

      setOriginalBranch(branch);
      
      // Extract country code from phone number if it exists
      let phoneWithoutCode = branch.phone_number || "";
      let extractedCountryCode = "";
      
      if (branch.phone_number && branch.phone_number.startsWith("+")) {
        // Try to extract common country codes
        if (branch.phone_number.startsWith("+1")) {
          extractedCountryCode = "+1";
          phoneWithoutCode = branch.phone_number.substring(2);
        } else if (branch.phone_number.startsWith("+20")) {
          extractedCountryCode = "+20";
          phoneWithoutCode = branch.phone_number.substring(3);
        }
        // Add more country codes as needed
      }

      setFormData({
        name: branch.name || "",
        address: branch.address || "",
        latitude: branch.latitude?.toString() || "",
        longitude: branch.longitude?.toString() || "",
        phone_number: phoneWithoutCode,
      });

      setCountryCode(extractedCountryCode);

      // Set location data for map
      if (branch.latitude && branch.longitude) {
        setSelectedLocationData({
          name: branch.name || "Branch Location",
          lat: parseFloat(branch.latitude.toString()),
          lng: parseFloat(branch.longitude.toString()),
          address: branch.address || "",
        });
        
        setCurrentLocation({
          lat: parseFloat(branch.latitude.toString()),
          lng: parseFloat(branch.longitude.toString()),
        });
      }
    } catch (error: any) {
      console.error("Error loading branch data:", error);
      setErrors({
        general: error.message || "Failed to load branch data",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Phone number validation function
  const validatePhoneNumber = (phoneNumber: string): { isValid: boolean; error?: string } => {
    if (!phoneNumber.trim()) {
      return { isValid: false, error: t("branches.phoneNumberRequired") };
    }
    
    // Basic phone number validation
    const phoneRegex = /^[\d\s\-\(\)]{7,15}$/;
    if (!phoneRegex.test(phoneNumber.replace(/\s/g, ''))) {
      return { isValid: false, error: t("branches.invalidPhoneNumber") };
    }
    
    return { isValid: true };
  };

  // Phone number formatting function (simplified)
  const formatPhoneNumber = (value: string): string => {
    const numericValue = value.replace(/\D/g, '');
    
    if (countryCode === "+1" && numericValue.length >= 6) {
      return numericValue.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    } else if (numericValue.length > 0) {
      return numericValue.replace(/(\d{3})(?=\d)/g, '$1 ');
    }
    
    return numericValue;
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

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formattedValue = formatPhoneNumber(value);
    
    handleInputChange("phone_number", formattedValue);
    
    // Real-time validation
    if (formattedValue.trim() !== '') {
      const validation = validatePhoneNumber(formattedValue);
      if (!validation.isValid && validation.error) {
        setErrors((prev) => ({ ...prev, phone_number: validation.error }));
      } else {
        setErrors((prev) => ({ ...prev, phone_number: undefined }));
      }
    }
  };

  const handleLocationSelect = (location: { name: string; lat: number; lng: number; address: string }) => {
    setSelectedLocationData(location);
    setFormData(prev => ({
      ...prev,
      address: location.address,
      latitude: location.lat.toString(),
      longitude: location.lng.toString(),
    }));
    
    // Clear location-related errors
    setErrors(prev => ({
      ...prev,
      address: undefined,
      latitude: undefined,
      longitude: undefined,
    }));
  };

  const openMapPicker = () => {
    setIsMapPickerOpen(true);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate required fields
    if (!formData.name.trim()) {
      newErrors.name = t("branches.nameRequired");
    }

    if (!formData.address.trim()) {
      newErrors.address = t("branches.addressRequired");
    }

    if (!selectedLocationData || !selectedLocationData.lat || !selectedLocationData.lng) {
      newErrors.address = t("branches.mapLocationRequired");
    }

    if (!formData.phone_number.trim()) {
      newErrors.phone_number = t("branches.phoneNumberRequired");
    } else {
      const phoneValidation = validatePhoneNumber(formData.phone_number);
      if (!phoneValidation.isValid) {
        newErrors.phone_number = phoneValidation.error;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Clean phone number for backend submission
      const cleanPhoneNumber = (phoneNumber: string): string => {
        return phoneNumber.replace(/[^\d+]/g, '');
      };

      const fullPhoneNumber = countryCode ? 
        `${countryCode}${cleanPhoneNumber(formData.phone_number)}` : 
        cleanPhoneNumber(formData.phone_number);

      const branchData: Auth.BranchUpdateData = {
        name: formData.name,
        address: formData.address,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        phone_number: fullPhoneNumber,
      };

      await updatePharmacyBranch(branchId, branchData);
      
      // Redirect to branches list on success
      router.push("/dashboard/profile");
    } catch (error: any) {
      console.error("Error updating branch:", error);
      setErrors({
        general: error.message || t("branches.updateError"),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push("/dashboard/profile");
  };

  if (isLoading) {
    return (
      <DashboardLayoutWithBreadcrumb title={t("branches.editBranch")} breadcrumbs={[{
        label: t("breadcrumbs.dashboard"),
        href: "/dashboard"
      }, {
        label: t("breadcrumbs.branches"),
        href: "/dashboard/profile"
      }]}>
        <div className="max-w-2xl bg-white rounded-lg shadow-md p-8">
          <div className="space-y-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index}>
                <div className="h-4 bg-gray-200 rounded w-24 mb-2 animate-pulse"></div>
                <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </DashboardLayoutWithBreadcrumb>
    );
  }

  return (
    <DashboardLayoutWithBreadcrumb title={t("branches.editBranch")} breadcrumbs={[{
      label: t("breadcrumbs.dashboard"),
      href: "/dashboard"
    }, {
      label: t("breadcrumbs.branches"),
      href: "/dashboard/profile"
    }]}>


      <div className="flex items-center mt-6 mb-8">
        <CustomButton
          onClick={handleCancel}
          className="rounded-full aspect-square w-10 h-10 mr-3"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </CustomButton>
        <div>
          <h1 className="text-2xl font-bold text-blue-gray">
            {t("branches.editBranch")}: {originalBranch?.name}
          </h1>
          <p className="text-gray-600 mt-1">{t("branches.editBranchDescription")}</p>
        </div>
      </div>

      <div className="max-w-2xl bg-white rounded-lg shadow-md p-8">
        {errors.general && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Branch Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("branches.branchName")}
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                errors.name ? "border-red-500" : "border-gray-200"
              }`}
              placeholder={t("branches.enterBranchName")}
              required
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Branch Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("branches.branchAddress")}
            </label>
            <div className={`flex items-center border rounded-lg px-4 py-3 ${
              selectedLocationData ? 'border-green-500 bg-green-50' : 
              errors.address ? 'border-red-500' : 'border-gray-200'
            }`}>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                className={`flex-1 focus:outline-none placeholder:text-gray-400 ${
                  selectedLocationData ? 'text-green-900 bg-green-50' : 'text-black'
                }`}
                placeholder={t("branches.enterBranchAddress")}
                required
              />
              <div className="cursor-pointer relative ml-3" onClick={openMapPicker}>
                <Icon 
                  icon={selectedLocationData ? "ph:check-circle-fill" : "ph:gps-light"} 
                  className={`transition-all duration-300 h-6 w-6 ${
                    selectedLocationData 
                      ? 'text-green-500' 
                      : 'text-blue-gray hover:text-blue-gray/80'
                  }`} 
                />
              </div>
            </div>
            {selectedLocationData && (
              <p className="text-green-600 text-xs mt-1 flex items-center gap-1">
                <Icon icon="solar:check-circle-bold" className="w-3 h-3" />
                {t("map.locationSelected")}: {selectedLocationData.name}
              </p>
            )}
            {errors.address && (
              <p className="text-red-500 text-sm mt-1">{errors.address}</p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("branches.phoneNumber")}
            </label>
            <div style={{ direction: 'ltr' }} className="flex items-center">
              <CountryCodeSelect
                selectedCountryCode={countryCode}
                onCountryCodeChange={setCountryCode}
              />
              <div className={`flex-1 flex items-center border-2 border-l-0 rounded-r-xl px-3 py-2 ${
                errors.phone_number ? 'border-red-500 bg-red-50' : 'border-gray-200'
              }`}>
                <input
                  type="tel"
                  value={formData.phone_number}
                  onChange={handlePhoneNumberChange}
                  className={`w-full text-sm focus:outline-none placeholder:text-gray-400 text-left ${
                    errors.phone_number ? 'text-red-900 bg-red-50' : 'text-black'
                  }`}
                  placeholder={t("branches.enterPhoneNumber")}
                  required
                />
              </div>
            </div>
            {errors.phone_number && (
              <p className="text-red-500 text-sm mt-1">{errors.phone_number}</p>
            )}
          </div>

          {/* Coordinates (Read-only, populated by map) */}
          {selectedLocationData && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("branches.latitude")}
                </label>
                <input
                  type="text"
                  value={formData.latitude}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
                  placeholder="25.0760"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("branches.longitude")}
                </label>
                <input
                  type="text"
                  value={formData.longitude}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
                  placeholder="55.1320"
                  readOnly
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6">
            <CustomButton
              type="button"
              onClick={handleCancel}
              className="px-6 py-3 rounded-lg transition-colors bg-red-500 text-white hover:bg-red-600"
            >
              {t("common.cancel")}
            </CustomButton>
            <CustomButton
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors ${
                isSubmitting ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{t("branches.updating")}</span>
                </div>
              ) : (
                t("branches.updateBranch")
              )}
            </CustomButton>
          </div>
        </form>
      </div>

      <GoogleMapPicker
        isOpen={isMapPickerOpen}
        onClose={() => setIsMapPickerOpen(false)}
        onLocationSelect={handleLocationSelect}
        apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}
        initialLocation={currentLocation || { lat: 40.7128, lng: -74.0060 }}
      />
    </DashboardLayoutWithBreadcrumb>
  );
};

export default EditBranchPage; 