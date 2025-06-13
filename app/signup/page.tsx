"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/api";
import { useTranslation } from "@/contexts/i18n-context";
import LanguageSwitcher from "@/components/language-switcher";
import CustomButton from "@/components/custom-button";
import { useQuery } from "@tanstack/react-query";
import { getCountries } from "@/services/countries";
import CountriesSelectBox from "@/components/ui/countries-select-box";
import { Icon } from "@iconify/react/dist/iconify.js";
import GoogleMapPicker from "@/components/google-map-picker";
import ImageUpload from "@/components/image-upload";
import axios from "axios";

// Clean phone number for backend submission (remove spaces and formatting)
const cleanPhoneNumber = (phoneNumber: string): string => {
  // Keep only digits and + sign
  return phoneNumber.replace(/[^\d+]/g, '');
};

// Phone number formatting function
const formatPhoneNumber = (value: string): string => {
  // Remove all non-digit characters except +
  const cleaned = value.replace(/[^\d+]/g, '');
  
  // If it starts with +, handle international format
  if (cleaned.startsWith('+')) {
    const countryCode = cleaned.slice(1);
    
    // Handle different country code lengths
    if (countryCode.length <= 1) {
      return `+${countryCode}`;
    } else if (countryCode.length <= 3) {
      return `+${countryCode}`;
    } else if (countryCode.length <= 6) {
      // +1 234 or +44 123
      const code = countryCode.slice(0, countryCode.length <= 4 ? 1 : 2);
      const rest = countryCode.slice(code.length);
      return `+${code} ${rest}`;
    } else if (countryCode.length <= 10) {
      // +1 234 567
      const code = countryCode.slice(0, countryCode.length <= 7 ? 1 : 2);
      const area = countryCode.slice(code.length, code.length + 3);
      const local = countryCode.slice(code.length + 3);
      return `+${code} ${area} ${local}`;
    } else {
      // +1 234 567 8901
      const code = countryCode.slice(0, countryCode.length <= 11 ? 1 : 2);
      const area = countryCode.slice(code.length, code.length + 3);
      const first = countryCode.slice(code.length + 3, code.length + 6);
      const last = countryCode.slice(code.length + 6);
      return `+${code} ${area} ${first} ${last}`;
    }
  }
  
  // Handle domestic US/Canada format
  const digits = cleaned;
  
  if (digits.length <= 3) {
    return digits;
  } else if (digits.length <= 6) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  } else if (digits.length <= 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  } else {
    // For longer numbers, add country code
    return `+${digits.slice(0, digits.length - 10)} (${digits.slice(-10, -7)}) ${digits.slice(-7, -4)}-${digits.slice(-4)}`;
  }
};

// Password validation function that matches Laravel validation rules
const validatePassword = (password: string, t?: (key: string) => string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Check if required
  if (!password || password.trim() === '') {
    return { isValid: false, errors: [t ? t('auth.passwordRequired') : 'Password is required'] };
  }

  // Minimum 8 characters
  if (password.length < 8) {
    errors.push(t ? t('auth.passwordMinLength') : 'Password must be at least 8 characters long');
  }

  // Must contain letters
  if (!/[a-zA-Z]/.test(password)) {
    errors.push(t ? t('auth.passwordMustContainLetters') : 'Password must contain letters');
  }

  // Must contain mixed case (both uppercase and lowercase)
  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password)) {
    errors.push(t ? t('auth.passwordMustContainMixedCase') : 'Password must contain both uppercase and lowercase letters');
  }

  // Must contain numbers
  if (!/[0-9]/.test(password)) {
    errors.push(t ? t('auth.passwordMustContainNumbers') : 'Password must contain numbers');
  }

  // Must contain symbols
  if (!/[^a-zA-Z0-9]/.test(password)) {
    errors.push(t ? t('auth.passwordMustContainSymbols') : 'Password must contain symbols');
  }

  return { isValid: errors.length === 0, errors };
};

// Phone number validation function
const validatePhoneNumber = (phoneNumber: string, t?: (key: string) => string): { isValid: boolean; error?: string } => {
  // Check if required
  if (!phoneNumber || phoneNumber.trim() === '') {
    return { isValid: false, error: t ? t('auth.phoneNumberRequired') : 'Phone number is required' };
  }

  // Check max length (255 characters as per backend)
  if (phoneNumber.length > 255) {
    return { isValid: false, error: t ? t('auth.phoneNumberMaxLength') : 'Phone number must not exceed 255 characters' };
  }

  // Basic phone number format validation
  // Allow digits, spaces, hyphens, parentheses, and plus sign
  const phoneRegex = /^[\+]?[\d\s\-\(\)]{7,20}$/;
  
  if (!phoneRegex.test(phoneNumber)) {
    return { isValid: false, error: t ? t('auth.phoneNumberValidFormat') : 'Please enter a valid phone number format' };
  }

  // Check if it contains at least 7 digits (minimum for most phone numbers)
  const digitsOnly = phoneNumber.replace(/\D/g, '');
  if (digitsOnly.length < 7) {
    return { isValid: false, error: t ? t('auth.phoneNumberMinDigits') : 'Phone number must contain at least 7 digits' };
  }

  if (digitsOnly.length > 15) {
    return { isValid: false, error: t ? t('auth.phoneNumberMaxDigits') : 'Phone number must not exceed 15 digits' };
  }

  return { isValid: true };
};

function SignupPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1 - User Details
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [retypePassword, setRetypePassword] = useState("");
  const [country, setCountry] = useState<number | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneNumberError, setPhoneNumberError] = useState<string | null>(null);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  // Step 2 - Pharmacy Details
  const [pharmacyName, setPharmacyName] = useState("");
  const [firstBranchName, setFirstBranchName] = useState("");
  const [branchAddress, setBranchAddress] = useState("");
  const [locationOfBranch, setLocationOfBranch] = useState("");
  const [branchPhoneNumber, setBranchPhoneNumber] = useState("");
  const [branchPhoneNumberError, setBranchPhoneNumberError] = useState<string | null>(null);

  // Step 3 - Image Upload
  const [uploadedImage, setUploadedImage] = useState<File>();
  
  // Map picker state
  const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);
  const [selectedLocationData, setSelectedLocationData] = useState<{
    name: string;
    lat: number;
    lng: number;
    address: string;
  } | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t, isRtl, locale } = useTranslation();

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Handle password change with real-time validation
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    
    // Real-time password validation
    if (value.trim() !== '') {
      const validation = validatePassword(value, t);
      setPasswordErrors(validation.errors);
    } else {
      setPasswordErrors([]);
    }
  };

  // Phone number validation and formatting handlers
  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Allow backspace to work properly - don't format if user is deleting
    const currentLength = phoneNumber.replace(/\D/g, '').length;
    const newLength = value.replace(/\D/g, '').length;
    
    if (newLength < currentLength) {
      // User is deleting, just validate without reformatting
      setPhoneNumber(value);
      if (value.trim() !== '') {
        const validation = validatePhoneNumber(value, t);
        setPhoneNumberError(validation.isValid ? null : validation.error || null);
      } else {
        setPhoneNumberError(null);
      }
    } else {
      // User is adding, format the phone number
      const formatted = formatPhoneNumber(value);
      setPhoneNumber(formatted);
      
      // Real-time validation
      if (formatted.trim() !== '') {
        const validation = validatePhoneNumber(formatted, t);
        setPhoneNumberError(validation.isValid ? null : validation.error || null);
      } else {
        setPhoneNumberError(null);
      }
    }
  };

  const handleBranchPhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Allow backspace to work properly - don't format if user is deleting
    const currentLength = branchPhoneNumber.replace(/\D/g, '').length;
    const newLength = value.replace(/\D/g, '').length;
    
    if (newLength < currentLength) {
      // User is deleting, just validate without reformatting
      setBranchPhoneNumber(value);
      if (value.trim() !== '') {
        const validation = validatePhoneNumber(value, t);
        setBranchPhoneNumberError(validation.isValid ? null : validation.error || null);
      } else {
        setBranchPhoneNumberError(null);
      }
    } else {
      // User is adding, format the phone number
      const formatted = formatPhoneNumber(value);
      setBranchPhoneNumber(formatted);
      
      // Real-time validation
      if (formatted.trim() !== '') {
        const validation = validatePhoneNumber(formatted, t);
        setBranchPhoneNumberError(validation.isValid ? null : validation.error || null);
      } else {
        setBranchPhoneNumberError(null);
      }
    }
  };

  useEffect(() => {
    // If user is already authenticated, redirect to dashboard
    if (isAuthenticated()) {
      router.push("/dashboard");
    }
  }, [router]);

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
    
    // Ultimate fallback to NYC if IP location fails
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
            setLocationError(null);
          },
          async (error) => {
            console.error("Error getting GPS location:", error);
            let errorMessage = "Unable to get precise location";
            
            switch (error.code) {
              case error.PERMISSION_DENIED:
                errorMessage = "Location access denied, using city from IP";
                break;
              case error.POSITION_UNAVAILABLE:
                errorMessage = "GPS unavailable, using city from IP";
                break;
              case error.TIMEOUT:
                errorMessage = "GPS timeout, using city from IP";
                break;
            }
            
            setLocationError(errorMessage);
            
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
        setLocationError("Geolocation not supported, using city from IP");
        // Fallback to IP-based location
        const ipLocation = await getLocationFromIP();
        setCurrentLocation(ipLocation);
      }
    };

    getCurrentLocation();
  }, []);

  const {
    data: countries,
    isLoading: isCountriesLoading,
    isError: isCountriesError,
    error: countriesError,
  } = useQuery({
    queryKey: ["countries"],
    queryFn: () => getCountries(locale as string),
  });

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    // Validate all required fields in Step 1
    const errors: string[] = [];
    
    if (!email.trim()) {
      errors.push(t("auth.emailRequired"));
    }
    
    if (!password.trim()) {
      errors.push(t("auth.passwordRequired"));
    }
    
    if (!retypePassword.trim()) {
      errors.push(t("auth.retypePasswordRequired"));
    }
    
    if (password !== retypePassword) {
      errors.push(t("auth.passwordsDoNotMatch"));
    }
    
    if (!country) {
      errors.push(t("auth.countryRequired"));
    }
    
    if (!phoneNumber.trim()) {
      errors.push(t("auth.phoneNumberRequired"));
    }
    
    if (!agreeToTerms) {
      errors.push(t("auth.agreeToTermsRequired"));
    }

    // Validate password complexity
    if (password.trim()) {
      const passwordValidation = validatePassword(password, t);
      if (!passwordValidation.isValid) {
        setPasswordErrors(passwordValidation.errors);
        errors.push(...passwordValidation.errors);
      }
    }

    // Validate phone number format
    if (phoneNumber.trim()) {
      const phoneValidation = validatePhoneNumber(phoneNumber, t);
      if (!phoneValidation.isValid) {
        setPhoneNumberError(phoneValidation.error || t("auth.validPhoneNumberRequired"));
        errors.push(t("auth.validPhoneNumberRequired"));
      }
    }

    if (errors.length > 0) {
      setError(errors.join(". "));
      return;
    }

    setCurrentStep(2);
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validate all required fields in Step 2
    const errors: string[] = [];
    
    if (!pharmacyName.trim()) {
      errors.push(t("auth.pharmacyNameRequired"));
    }
    
    if (!firstBranchName.trim()) {
      errors.push(t("auth.firstBranchNameRequired"));
    }
    
    if (!branchAddress.trim()) {
      errors.push(t("auth.branchAddressRequired"));
    }
    
    if (!locationOfBranch.trim()) {
      errors.push(t("auth.locationOfBranchRequired"));
    }
    
    if (!selectedLocationData || !selectedLocationData.lat || !selectedLocationData.lng) {
      errors.push(t("auth.mapLocationRequired"));
    }
    
    if (!branchPhoneNumber.trim()) {
      errors.push(t("auth.branchPhoneNumberRequired"));
    }
    
    if (!agreeToTerms) {
      errors.push(t("auth.agreeToTermsRequired"));
    }

    // Validate branch phone number format
    if (branchPhoneNumber.trim()) {
      const branchPhoneValidation = validatePhoneNumber(branchPhoneNumber, t);
      if (!branchPhoneValidation.isValid) {
        setBranchPhoneNumberError(branchPhoneValidation.error || t("auth.validBranchPhoneNumberRequired"));
        errors.push(t("auth.validBranchPhoneNumberRequired"));
      }
    }

    if (errors.length > 0) {
      setError(errors.join(". "));
      return;
    }

    setCurrentStep(3);
  };

  const handleStep3Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      setError(null);
      setSuccess(null);

      // Validate all required fields across all steps before final submission
      const errors: string[] = [];

      // Step 1 validation
      if (!email.trim()) errors.push(t("auth.emailRequired"));
      if (!password.trim()) errors.push(t("auth.passwordRequired"));
      if (!country) errors.push(t("auth.countrySelectionRequired"));
      if (!phoneNumber.trim()) errors.push(t("auth.phoneNumberRequired"));
      if (!agreeToTerms) errors.push(t("auth.agreementToTermsRequired"));

      // Step 2 validation
      if (!pharmacyName.trim()) errors.push(t("auth.pharmacyNameRequired"));
      if (!firstBranchName.trim()) errors.push(t("auth.firstBranchNameRequired"));
      if (!branchAddress.trim()) errors.push(t("auth.branchAddressRequired"));
      if (!locationOfBranch.trim()) errors.push(t("auth.locationOfBranchRequired"));
      if (!selectedLocationData || !selectedLocationData.lat || !selectedLocationData.lng) {
        errors.push(t("auth.mapLocationRequired"));
      }
      if (!branchPhoneNumber.trim()) errors.push(t("auth.branchPhoneNumberRequired"));

      // Step 3 validation
      if (!uploadedImage) {
        errors.push(t("auth.imageUploadRequired"));
      }

      // Phone number format validation
      const phoneValidation = validatePhoneNumber(phoneNumber, t);
      const branchPhoneValidation = validatePhoneNumber(branchPhoneNumber, t);

      if (!phoneValidation.isValid) {
        setPhoneNumberError(phoneValidation.error || t("auth.validPhoneNumberRequired"));
        errors.push(t("auth.validPhoneNumberRequired"));
      }

      if (!branchPhoneValidation.isValid) {
        setBranchPhoneNumberError(branchPhoneValidation.error || t("auth.validBranchPhoneNumberRequired"));
        errors.push(t("auth.validBranchPhoneNumberRequired"));
      }

      if (errors.length > 0) {
        setError(errors.join(". "));
        
        // Navigate to the appropriate step based on the type of error
        if (errors.some(error => 
          error === t("auth.emailRequired") || 
          error === t("auth.passwordRequired") || 
          error === t("auth.retypePasswordRequired") ||
          error === t("auth.countryRequired") ||
          error === t("auth.countrySelectionRequired") ||
          error === t("auth.phoneNumberRequired") ||
          error === t("auth.validPhoneNumberRequired") ||
          error === t("auth.agreeToTermsRequired") ||
          error === t("auth.agreementToTermsRequired") ||
          error === t("auth.passwordsDoNotMatch")
        )) {
          setCurrentStep(1);
        } else if (errors.some(error => 
          error === t("auth.pharmacyNameRequired") ||
          error === t("auth.firstBranchNameRequired") ||
          error === t("auth.branchAddressRequired") ||
          error === t("auth.locationOfBranchRequired") ||
          error === t("auth.mapLocationRequired") ||
          error === t("auth.branchPhoneNumberRequired") ||
          error === t("auth.validBranchPhoneNumberRequired")
        )) {
          setCurrentStep(2);
        } else {
          setCurrentStep(3);
        }
        return;
      }
      
      // Create FormData object for multipart/form-data submission
      const formData = new FormData();
      formData.append('name', pharmacyName);
      formData.append('email', email);
      formData.append('phone_number', cleanPhoneNumber(phoneNumber));
      formData.append('password', password);
      formData.append('password_confirmation', password);
      formData.append('country_id', country?.toString() || '');
      
      // Append nested branch data with bracket notation
      formData.append('branch[name]', firstBranchName);
      formData.append('branch[address]', branchAddress);
      formData.append('branch[latitude]', selectedLocationData?.lat?.toString() || '');
      formData.append('branch[longitude]', selectedLocationData?.lng?.toString() || '');
      formData.append('branch[phone_number]', cleanPhoneNumber(branchPhoneNumber));
      
      // Append the file
      if (uploadedImage) {
        formData.append('avatar', uploadedImage);
      }

      // Debug logging to see what's being sent
      console.log('FormData entries:');
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`${key}:`, { name: value.name, size: value.size, type: value.type });
        } else {
          console.log(`${key}:`, value);
        }
      }

      const response = await axios.post("/api/signup", formData, {
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'Accept-Language': locale,
        }
      });
      
      if (response.status === 201) {
        // setSuccess(t("auth.signupFunctionalityMessage"));
        window.location.href = `/login?message=${t("auth.signupFunctionalityMessage")}`;
      } else {
        setError(response.data.message);
      }
    } catch (err: any) {
      console.error("Signup error:", err);
      setError(err.response.data.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCountryChange = (id: number) => {
    setCountry(id);
  };

  const handleLocationSelect = (location: { name: string; lat: number; lng: number; address: string }) => {
    setSelectedLocationData(location);
    setLocationOfBranch(location.address);
  };

  const openMapPicker = () => {
    setIsMapPickerOpen(true);
  };

  const handleImagesChange = (images: File[]) => {
    setUploadedImage(images[0]);
  };

  const handleDeleteImage = (index: number) => {
    setUploadedImage(undefined);
  };

  const renderStep1 = () => (
    <form onSubmit={handleStep1Submit} className="flex flex-col gap-4">
      <div className="flex flex-col">
        <label htmlFor="email" className="text-sm text-blue-gray mb-3 px-0.5">
          {t("auth.email")}
        </label>
        <div className="flex items-center border-2 border-[#E4E4E7] rounded-xl shadow-sm px-3 py-2">
          <input
            id="email"
            type="email"
            placeholder={t("auth.enterYourEmail")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full text-sm focus:outline-none placeholder:text-[#71717A] text-black"
            required
          />
        </div>
      </div>

      <div className="flex flex-col">
        <label
          htmlFor="password"
          className="text-sm text-blue-gray mb-3 px-0.5"
        >
          {t("auth.password")}
        </label>
        <div className={`flex items-center border-2 rounded-xl shadow-sm px-3 py-2 ${
          passwordErrors.length > 0 ? 'border-red-500 bg-red-50' : 'border-[#E4E4E7]'
        }`}>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder={t("auth.enterYourPassword")}
            value={password}
            onChange={handlePasswordChange}
            className={`w-full text-sm focus:outline-none placeholder:text-[#71717A] ${
              passwordErrors.length > 0 ? 'text-red-900 bg-red-50' : 'text-black'
            }`}
            required
          />
        </div>
        {passwordErrors.length > 0 && (
          <div className="mt-1 px-0.5">
            {passwordErrors.map((error, index) => (
              <p key={index} className="text-red-500 text-xs">{error}</p>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col">
        <label
          htmlFor="retypePassword"
          className="text-sm text-blue-gray mb-3 px-0.5"
        >
          {t("auth.retypePassword")}
        </label>
        <div className="flex items-center border-2 border-[#E4E4E7] rounded-xl shadow-sm px-3 py-2">
          <input
            id="retypePassword"
            type={showPassword ? "text" : "password"}
            placeholder={t("auth.retypeYourPassword")}
            value={retypePassword}
            onChange={(e) => setRetypePassword(e.target.value)}
            className="w-full text-sm focus:outline-none placeholder:text-[#71717A] text-black"
            required
          />
        </div>
      </div>

      <div className="flex flex-col">
        <label htmlFor="country" className="text-sm text-blue-gray mb-3 px-0.5">
          {t("auth.country")}
        </label>

        <CountriesSelectBox
          countries={countries || []}
          selectedCountry={country}
          onChange={(e) => handleCountryChange(e)}
        />
      </div>

      <div className="flex flex-col">
        <label
          htmlFor="phoneNumber"
          className="text-sm text-blue-gray mb-3 px-0.5"
        >
          {t("auth.phoneNumber")}
        </label>
        <div className={`flex items-center border-2 rounded-xl shadow-sm px-3 py-2 ${
          phoneNumberError ? 'border-red-500 bg-red-50' : 'border-[#E4E4E7]'
        }`}>
          <input
            id="phoneNumber"
            type="tel"
            placeholder={t("auth.enterPhoneNumber")}
            value={phoneNumber}
            onChange={handlePhoneNumberChange}
            className={`w-full text-sm focus:outline-none placeholder:text-[#71717A] text-left ${
              phoneNumberError ? 'text-red-900 bg-red-50' : 'text-black'
            }`}
            required
          />
        </div>
        {phoneNumberError && (
          <p className="text-red-500 text-xs mt-1 px-0.5">{phoneNumberError}</p>
        )}
      </div>

      <div className="flex items-center mt-2">
        <div
          className={`h-5 w-5 rounded-md border-2 flex items-center justify-center mr-3 cursor-pointer ${
            agreeToTerms ? "bg-[#007AFF] border-[#007AFF]" : "border-[#007AFF]"
          }`}
          onClick={() => setAgreeToTerms(!agreeToTerms)}
        >
          {agreeToTerms && (
            <Image
              src="/images/tick.svg"
              alt="Checked"
              width={14}
              height={14}
            />
          )}
        </div>
        <label
          className="text-sm text-blue-gray cursor-pointer"
          onClick={() => setAgreeToTerms(!agreeToTerms)}
        >
          {t("auth.iAgreeWith")}{" "}
          <span className="text-[#007AFF]">{t("auth.terms")}</span>{" "}
          {t("auth.and")}{" "}
          <span className="text-[#007AFF]">{t("auth.privacyPolicy")}</span>
        </label>
      </div>

      <CustomButton
        disabled={!agreeToTerms}
        className="w-full bg-[#007AFF] text-white rounded-xl mt-4 text-sm font-medium disabled:opacity-50 py-5"
      >
        {t("auth.next")}
      </CustomButton>
    </form>
  );

  const renderStep2 = () => (
    <form onSubmit={handleStep2Submit} className="flex flex-col gap-4">
      <div className="flex flex-col">
        <label
          htmlFor="pharmacyName"
          className="text-sm text-blue-gray mb-3 px-0.5"
        >
          {t("auth.pharmacyName")}
        </label>
        <div className="flex items-center border-2 border-[#E4E4E7] rounded-xl shadow-sm px-3 py-2">
          <input
            id="pharmacyName"
            type="text"
            placeholder={t("auth.enterPharmacyName")}
            value={pharmacyName}
            onChange={(e) => setPharmacyName(e.target.value)}
            className="w-full text-sm focus:outline-none placeholder:text-[#71717A] text-black"
            required
          />
        </div>
      </div>

      <div className="flex flex-col">
        <label
          htmlFor="firstBranchName"
          className="text-sm text-blue-gray mb-3 px-0.5"
        >
          {t("auth.firstBranchName")}
        </label>
        <div className="flex items-center border-2 border-[#E4E4E7] rounded-xl shadow-sm px-3 py-2">
          <input
            id="firstBranchName"
            type="text"
            placeholder={t("auth.enterFirstBranchName")}
            value={firstBranchName}
            onChange={(e) => setFirstBranchName(e.target.value)}
            className="w-full text-sm focus:outline-none placeholder:text-[#71717A] text-black"
            required
          />
        </div>
      </div>

      <div className="flex flex-col">
        <label
          htmlFor="branchAddress"
          className="text-sm text-blue-gray mb-3 px-0.5"
        >
          {t("auth.branchAddress")}
        </label>
        <div className="flex items-center border-2 border-[#E4E4E7] rounded-xl shadow-sm px-3 py-2">
          <input
            id="branchAddress"
            type="text"
            placeholder={t("auth.enterBranchAddress")}
            value={branchAddress}
            onChange={(e) => setBranchAddress(e.target.value)}
            className="w-full text-sm focus:outline-none placeholder:text-[#71717A] text-black"
            required
          />
        </div>
      </div>

      <div className="flex flex-col">
        <label
          htmlFor="locationOfBranch"
          className="text-sm text-blue-gray mb-3 px-0.5"
        >
          {t("auth.locationOfBranch")}
        </label>
        <div className={`flex items-center border-2 rounded-xl shadow-sm px-3 py-2 ${
          selectedLocationData ? 'border-green-500 bg-green-50' : 'border-[#E4E4E7]'
        }`}>
          <input
            id="locationOfBranch"
            type="text"
            placeholder={t("auth.locationOfBranch")}
            value={locationOfBranch}
            onChange={(e) => setLocationOfBranch(e.target.value)}
            className={`w-full text-sm focus:outline-none placeholder:text-[#71717A] ${
              selectedLocationData ? 'text-green-900 bg-green-50' : 'text-black'
            }`}
            required
          />
          <div className="cursor-pointer relative" onClick={openMapPicker}>
            <Icon 
              icon={selectedLocationData ? "ph:check-circle-fill" : "ph:gps-light"} 
              className={`transition-all duration-300 h-6 w-6 ${
                selectedLocationData 
                  ? 'text-green-500' 
                  : 'text-blue-gray hover:text-blue-gray/80'
              }`} 
            />
            {currentLocation && !locationError && !selectedLocationData && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></div>
            )}
          </div>
        </div>
        {selectedLocationData && (
          <p className="text-green-600 text-xs mt-1 px-0.5">
            ✓ {t("map.locationSelected")}: {selectedLocationData.name}
          </p>
        )}
      </div>

      <div className="flex flex-col">
        <label
          htmlFor="branchPhoneNumber"
          className="text-sm text-blue-gray mb-3 px-0.5"
        >
          {t("auth.branchPhoneNumber")}
        </label>
        <div className={`flex items-center border-2 rounded-xl shadow-sm px-3 py-2 ${
          branchPhoneNumberError ? 'border-red-500 bg-red-50' : 'border-[#E4E4E7]'
        }`}>
          <input
            id="branchPhoneNumber"
            type="tel"
            placeholder={t("auth.enterBranchPhoneNumber")}
            value={branchPhoneNumber}
            onChange={handleBranchPhoneNumberChange}
            className={`w-full text-sm focus:outline-none placeholder:text-[#71717A] text-left ${
              branchPhoneNumberError ? 'text-red-900 bg-red-50' : 'text-black'
            }`}
            required
          />
        </div>
        {branchPhoneNumberError && (
          <p className="text-red-500 text-xs mt-1 px-0.5">{branchPhoneNumberError}</p>
        )}
      </div>

      <div className="flex items-center mt-2">
        <div
          className={`h-5 w-5 rounded-md border-2 flex items-center justify-center mr-3 cursor-pointer ${
            agreeToTerms ? "bg-[#007AFF] border-[#007AFF]" : "border-[#007AFF]"
          }`}
          onClick={() => setAgreeToTerms(!agreeToTerms)}
        >
          {agreeToTerms && (
            <Image
              src="/images/tick.svg"
              alt="Checked"
              width={14}
              height={14}
            />
          )}
        </div>
        <label
          className="text-sm text-blue-gray cursor-pointer"
          onClick={() => setAgreeToTerms(!agreeToTerms)}
        >
          {t("auth.iAgreeWith")}{" "}
          <span className="text-[#007AFF]">{t("auth.terms")}</span>{" "}
          {t("auth.and")}{" "}
          <span className="text-[#007AFF]">{t("auth.privacyPolicy")}</span>
        </label>
      </div>

      <div className="flex gap-3 mt-4">
        <CustomButton
          type="button"
          onClick={() => setCurrentStep(1)}
          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl text-sm font-medium cursor-pointer py-5"
        >
          {t("auth.back")}
        </CustomButton>
        <CustomButton
          disabled={!agreeToTerms}
          className="flex-1 bg-[#007AFF] text-white rounded-xl text-sm font-medium disabled:opacity-50 cursor-pointer py-5"
        >
          {t("auth.next")}
        </CustomButton>
      </div>
    </form>
  );

  const renderStep3 = () => (
    <form onSubmit={handleStep3Submit} className="flex flex-col gap-4">
      <div className="flex flex-col">
        <label className="text-sm text-blue-gray mb-3 px-0.5">
          {t("auth.uploadImages")}
        </label>
        <p className="text-xs text-[#71717A] mb-4 px-0.5">
          {t("auth.uploadImagesDescription")}
        </p>
        
        <ImageUpload
          onImagesChange={handleImagesChange}
          onDeleteImage={handleDeleteImage}
          existingImages={uploadedImage ? [{
            url: URL.createObjectURL(uploadedImage),
            isPrimary: true,
            id: `${uploadedImage.name}`,
            name: uploadedImage.name,
            size: uploadedImage.size,
            type: uploadedImage.type
          }] : []}
          isOnlyOneImage={true}
        />
      </div>

      <div className="flex gap-3 mt-4">
        <CustomButton
          type="button"
          onClick={() => setCurrentStep(2)}
          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl text-sm font-medium cursor-pointer py-5"
        >
          {t("auth.back")}
        </CustomButton>
        <CustomButton
          className="flex-1 bg-[#007AFF] text-white rounded-xl text-sm font-medium cursor-pointer py-5"
          disabled={!agreeToTerms || !uploadedImage || isSubmitting}
        >
          {t("auth.signUp")}
        </CustomButton>
      </div>
    </form>
  );

  return (
    <div className="flex min-h-screen w-full bg-[#F4F4F4]">
      <div className="relative flex-1 hidden lg:block">
        <div className="absolute inset-0">
          <Image
            src="/images/register-page.png"
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
                PharmaGo
              </h1>
              <p className="text-white font-medium text-[10px] leading-4 tracking-tight">
                {t("brand.bringingPharmacyToYourDoor")}
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

      <div className="flex flex-col items-center justify-center flex-1 p-4 min-h-screen lg:min-h-0">
        <div className="w-full max-w-[384px] bg-white rounded-2xl shadow-md p-6 lg:p-8">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-2xl font-semibold text-blue-gray leading-tight">
                {t("auth.signUp")}
              </h1>
              <span className="text-sm text-[#71717A]">
                {t("auth.step")} {currentStep}/3
              </span>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 text-green-600 border border-green-200 rounded-lg text-sm">
              {success}
            </div>
          )}

          {currentStep === 1 ? renderStep1() : currentStep === 2 ? renderStep2() : renderStep3()}

          <div className="mt-6 flex justify-center gap-1 text-sm">
            <span className="text-blue-gray">
              {t("auth.alreadyHaveAccount")}
            </span>
            <Link href="/login" className="text-[#007AFF]">
              {t("auth.logIn")}
            </Link>
          </div>
        </div>
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
}

export default SignupPage;
