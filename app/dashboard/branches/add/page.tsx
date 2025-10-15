"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon, MapPinIcon } from "lucide-react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useTranslation } from "@/contexts/i18n-context";
import CustomButton from "@/components/custom-button";
import Breadcrumb from "@/components/ui/breadcrumb";
import GoogleMapPicker from "@/components/google-map-picker";
import CountryCodeSelect from "@/components/ui/country-code-select";
import {
  createSupplierBranch,
} from "@/services/supplier-profile";

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

const AddBranchPage: React.FC = () => {
  const { t, isRtl } = useTranslation();
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    name: "",
    address: "",
    latitude: "",
    longitude: "",
    phone_number: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countryCode, setCountryCode] = useState("");

  // Map picker state
  const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);
  const [selectedLocationData, setSelectedLocationData] = useState<{
    name: string;
    lat: number;
    lng: number;
    address: string;
  } | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);

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

  // Get user's location based on IP address
  const getLocationFromIP = async () => {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      
      if (data.latitude && data.longitude) {
        return {
          lat: parseFloat(data.latitude),
          lng: parseFloat(data.longitude),
        };
      }
    } catch (error) {
      console.error('Error getting IP location:', error);
    }
    
    // Fallback to NYC if IP location fails
    return { lat: 40.7128, lng: -74.0060 };
  };

  // Get user's current location on component mount
  useEffect(() => {
    const getCurrentLocation = async () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setCurrentLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
          },
          async (error) => {
            console.error("Error getting GPS location:", error);
            // Fallback to IP-based location
            const ipLocation = await getLocationFromIP();
            setCurrentLocation(ipLocation);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000, // 5 minutes
          }
        );
      } else {
        // Fallback to IP-based location
        const ipLocation = await getLocationFromIP();
        setCurrentLocation(ipLocation);
      }
    };

    getCurrentLocation();
  }, []);

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

      const branchData: Auth.BranchCreateData = {
        name: formData.name,
        address: formData.address,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        phone_number: fullPhoneNumber,
      };

      await createSupplierBranch(branchData);
      
      // Redirect to branches list on success
      router.push("/dashboard/branches");
    } catch (error: any) {
      console.error("Error creating branch:", error);
      setErrors({
        general: error.message || t("branches.createError"),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push("/dashboard/branches");
  };

  return (
    <div className="py-8">
      <Breadcrumb
        items={[
          { label: t("breadcrumbs.dashboard"), href: "/dashboard" },
          { label: t("breadcrumbs.branches"), href: "/dashboard/branches" },
          { label: t("breadcrumbs.addBranch"), href: "/dashboard/branches/add" },
        ]}
      />

      <div className="flex items-center mt-6 mb-8">
        <CustomButton
          onClick={handleCancel}
          className="mr-4 p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </CustomButton>
        <div>
          <h1 className="text-2xl font-bold text-blue-gray">{t("branches.addBranch")}</h1>
          <p className="text-gray-600 mt-1">{t("branches.addBranchDescription")}</p>
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
                {currentLocation && !selectedLocationData && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></div>
                )}
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
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
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
                  <span>{t("branches.creating")}</span>
                </div>
              ) : (
                t("branches.createBranch")
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
    </div>
  );
};

export default AddBranchPage; 