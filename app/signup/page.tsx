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
import CountryCodeSelect from "@/components/ui/country-code-select";
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

// WhatsApp number checking function
const checkWhatsAppNumber = async (phoneNumber: string, countryCode: string): Promise<{ hasWhatsApp: boolean; error?: string }> => {
  try {
    // Combine country code with phone number for checking
    const fullPhoneNumber = countryCode ? `${countryCode}${cleanPhoneNumber(phoneNumber)}` : cleanPhoneNumber(phoneNumber);
    
    const response = await axios.post('/api/whatsapp/check-number', {
      phoneNumber: fullPhoneNumber
    });
    
    return { hasWhatsApp: response.data.has_whatsapp || false };
  } catch (error: any) {
    console.error('WhatsApp check error:', error);
    return { 
      hasWhatsApp: false, 
      error: error.response?.data?.error || 'Failed to check WhatsApp number' 
    };
  }
};

function SignupPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1 - User Details
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [retypePassword, setRetypePassword] = useState("");
  const [country, setCountry] = useState<number | null>(null);
  const [countryCode, setCountryCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneNumberError, setPhoneNumberError] = useState<string | null>(null);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  // Step 2 - Company Details
  const [companyName, setCompanyName] = useState("");
  const [companyLicense, setCompanyLicense] = useState("");
  const [description, setDescription] = useState("");
  const [locationName, setLocationName] = useState("");
  const [locationAddress, setLocationAddress] = useState("");
  const [locationCountryCode, setLocationCountryCode] = useState("");
  const [locationPhoneNumber, setLocationPhoneNumber] = useState("");
  const [locationPhoneNumberError, setLocationPhoneNumberError] = useState<string | null>(null);

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
  const [isCheckingWhatsApp, setIsCheckingWhatsApp] = useState(false);
  const { t, isRtl, locale } = useTranslation();

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [whatsAppError, setWhatsAppError] = useState<string | null>(null);

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
    
    // Remove all non-numeric characters for simpler handling when using country code select
    const numericValue = value.replace(/\D/g, '');
    
    // Basic formatting for US numbers if using +1
    let formattedValue = numericValue;
    if (countryCode === "+1" && numericValue.length >= 6) {
      formattedValue = numericValue.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    } else if (numericValue.length > 0) {
      // For other countries, add spaces every 3 digits for readability
      formattedValue = numericValue.replace(/(\d{3})(?=\d)/g, '$1 ');
    }
    
    setPhoneNumber(formattedValue);
    
    // Real-time validation
    if (formattedValue.trim() !== '') {
      const validation = validatePhoneNumber(formattedValue, t);
      setPhoneNumberError(validation.isValid ? null : validation.error || null);
    } else {
      setPhoneNumberError(null);
    }
  };

  const handleLocationPhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Remove all non-numeric characters for simpler handling when using country code select
    const numericValue = value.replace(/\D/g, '');
    
    // Basic formatting for US numbers if using +1
    let formattedValue = numericValue;
    if (locationCountryCode === "+1" && numericValue.length >= 6) {
      formattedValue = numericValue.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    } else if (numericValue.length > 0) {
      // For other countries, add spaces every 3 digits for readability
      formattedValue = numericValue.replace(/(\d{3})(?=\d)/g, '$1 ');
    }
    
    setLocationPhoneNumber(formattedValue);
    
    // Real-time validation
    if (formattedValue.trim() !== '') {
      const validation = validatePhoneNumber(formattedValue, t);
      setLocationPhoneNumberError(validation.isValid ? null : validation.error || null);
    } else {
      setLocationPhoneNumberError(null);
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

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setWhatsAppError(null);
    
    // Validate all required fields in Step 1
    const errors: string[] = [];
    
    if (!name.trim()) {
      errors.push(t("auth.nameRequired"));
    }
    
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

    // Check if phone number has WhatsApp
    setIsCheckingWhatsApp(true);
    try {
      const whatsAppCheck = await checkWhatsAppNumber(phoneNumber, countryCode);
      
      if (whatsAppCheck.error) {
        setWhatsAppError(whatsAppCheck.error);
        return;
      }
      
      if (!whatsAppCheck.hasWhatsApp) {
        setWhatsAppError(t("auth.phoneNumberNoWhatsApp") || "This phone number doesn't have a WhatsApp account. Please use a number with WhatsApp.");
        return;
      }
      
      // If WhatsApp check passes, proceed to next step
      setCurrentStep(2);
    } catch (error) {
      setWhatsAppError(t("auth.whatsAppCheckFailed") || "Failed to verify WhatsApp number. Please try again.");
    } finally {
      setIsCheckingWhatsApp(false);
    }
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setWhatsAppError(null);
    setCurrentStep(3);
    // setError(null);
    // setSuccess(null);
    // setWhatsAppError(null);

    // // Validate all required fields in Step 2
    // const errors: string[] = [];
    
    // if (!companyName.trim()) {
    //   errors.push(t("auth.companyNameRequired"));
    // }
    
    // if (!locationName.trim()) {
    //   errors.push(t("auth.locationNameRequired"));
    // }
    
    // if (!locationAddress.trim()) {
    //   errors.push(t("auth.locationAddressRequired"));
    // }
    
    // if (!selectedLocationData || !selectedLocationData.lat || !selectedLocationData.lng) {
    //   errors.push(t("auth.mapLocationRequired"));
    // }
    
    // // if (!locationPhoneNumber.trim()) {
    // //   errors.push(t("auth.locationPhoneNumberRequired"));
    // // }
    
    // if (!agreeToTerms) {
    //   errors.push(t("auth.agreeToTermsRequired"));
    // }

    // // Validate location phone number format
    // // if (locationPhoneNumber.trim()) {
    // //   const locationPhoneValidation = validatePhoneNumber(locationPhoneNumber, t);
    // //   if (!locationPhoneValidation.isValid) {
    // //     setLocationPhoneNumberError(locationPhoneValidation.error || t("auth.validLocationPhoneNumberRequired"));
    // //     errors.push(t("auth.validLocationPhoneNumberRequired"));
    // //   }
    // // }

    // if (errors.length > 0) {
    //   setError(errors.join(". "));
    //   return;
    // }

    // // Check if location phone number has WhatsApp
    // setIsCheckingWhatsApp(true);
    // try {
    //   const whatsAppCheck = await checkWhatsAppNumber(locationPhoneNumber, locationCountryCode);
      
    //   if (whatsAppCheck.error) {
    //     setWhatsAppError(whatsAppCheck.error);
    //     return;
    //   }
      
    //   if (!whatsAppCheck.hasWhatsApp) {
    //     setWhatsAppError(t("auth.locationPhoneNumberNoWhatsApp") || "This location phone number doesn't have a WhatsApp account. Please use a number with WhatsApp.");
    //     return;
    //   }
      
    //   // If WhatsApp check passes, proceed to next step
    //   setCurrentStep(3);
    // } catch (error) {
    //   setWhatsAppError(t("auth.whatsAppCheckFailed") || "Failed to verify WhatsApp number. Please try again.");
    // } finally {
    //   setIsCheckingWhatsApp(false);
    // }
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
      if (!name.trim()) errors.push(t("auth.nameRequired"));
      if (!email.trim()) errors.push(t("auth.emailRequired"));
      if (!password.trim()) errors.push(t("auth.passwordRequired"));
      if (!country) errors.push(t("auth.countrySelectionRequired"));
      if (!phoneNumber.trim()) errors.push(t("auth.phoneNumberRequired"));
      if (!agreeToTerms) errors.push(t("auth.agreementToTermsRequired"));

      // Step 2 validation
      if (!companyName.trim()) errors.push(t("auth.companyNameRequired"));
      if (!locationName.trim()) errors.push(t("auth.locationNameRequired"));
      if (!locationAddress.trim()) errors.push(t("auth.locationAddressRequired"));
      if (!selectedLocationData || !selectedLocationData.lat || !selectedLocationData.lng) {
        errors.push(t("auth.mapLocationRequired"));
      }
      // if (!locationPhoneNumber.trim()) errors.push(t("auth.locationPhoneNumberRequired"));

      // Step 3 validation
      if (!uploadedImage) {
        errors.push(t("auth.imageUploadRequired"));
      }

      // Phone number format validation
      const phoneValidation = validatePhoneNumber(phoneNumber, t);
      const locationPhoneValidation = validatePhoneNumber(locationPhoneNumber, t);

      if (!phoneValidation.isValid) {
        setPhoneNumberError(phoneValidation.error || t("auth.validPhoneNumberRequired"));
        errors.push(t("auth.validPhoneNumberRequired"));
      }

      // if (!locationPhoneValidation.isValid) {
      //   setLocationPhoneNumberError(locationPhoneValidation.error || t("auth.validLocationPhoneNumberRequired"));
      //   errors.push(t("auth.validLocationPhoneNumberRequired"));
      // }

      if (errors.length > 0) {
        setError(errors.join(". "));
        
        // Navigate to the appropriate step based on the type of error
        if (errors.some(error => 
          error === t("auth.nameRequired") ||
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
          error === t("auth.companyNameRequired") ||
          error === t("auth.locationNameRequired") ||
          error === t("auth.locationAddressRequired") ||
          error === t("auth.mapLocationRequired")
          // error === t("auth.locationPhoneNumberRequired") ||
          // error === t("auth.validLocationPhoneNumberRequired")
        )) {
          setCurrentStep(2);
        } else {
          setCurrentStep(3);
        }
        return;
      }
      
      // Create FormData object for multipart/form-data submission
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      
      // Combine country code with phone number
      const fullPhoneNumber = countryCode ? `${countryCode}${cleanPhoneNumber(phoneNumber)}` : cleanPhoneNumber(phoneNumber);
      formData.append('phone_number', fullPhoneNumber);
      
      formData.append('password', password);
      formData.append('company_name', companyName);
      
      // Optional fields
      if (companyLicense.trim()) {
        formData.append('company_license', companyLicense);
      }
      if (description.trim()) {
        formData.append('description', description);
      }
      
      formData.append('country_id', country?.toString() || '');
      
      // Append nested location data with bracket notation
      formData.append('location[name]', locationName);
      formData.append('location[address]', locationAddress);
      formData.append('location[latitude]', selectedLocationData?.lat?.toString() || '');
      formData.append('location[longitude]', selectedLocationData?.lng?.toString() || '');
      
      // Combine location country code with location phone number
      const fullLocationPhoneNumber = locationCountryCode ? `${locationCountryCode}${cleanPhoneNumber(locationPhoneNumber)}` : cleanPhoneNumber(locationPhoneNumber);
      formData.append('location[phone_number]', fullLocationPhoneNumber);
      
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
    setLocationAddress(location.address);
    setLocationName(location.name);
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
    <form onSubmit={handleStep1Submit} className="flex flex-col gap-4" name="registration" data-form-type="signup">
      {/* Hidden field to signal registration form to password managers */}
      <input type="hidden" name="signup" value="1" />
      <input type="hidden" name="registration" value="true" />
      
      <div className="flex flex-col">
        <label htmlFor="name" className="text-sm text-blue-gray mb-3 px-0.5">
          {t("auth.name")}
        </label>
        <div className="flex items-center border-2 border-[#E4E4E7] rounded-xl shadow-sm px-3 py-2">
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder={t("auth.enterYourName")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full text-sm focus:outline-none placeholder:text-[#71717A] text-black"
            required
          />
        </div>
      </div>

      <div className="flex flex-col">
        <label htmlFor="email" className="text-sm text-blue-gray mb-3 px-0.5">
          {t("auth.email")}
        </label>
        <div className="flex items-center border-2 border-[#E4E4E7] rounded-xl shadow-sm px-3 py-2">
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder={t("auth.enterYourEmail")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full text-sm focus:outline-none placeholder:text-[#71717A] text-black"
            required
          />
          {/* Hidden username field that mirrors email for password managers */}
          <input
            type="hidden"
            name="username"
            autoComplete="username"
            value={email}
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
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            data-form-type="password"
            data-role="password"
            placeholder={t("auth.enterYourPassword")}
            value={password}
            onChange={handlePasswordChange}
            className={`w-full text-sm focus:outline-none placeholder:text-[#71717A] ${
              passwordErrors.length > 0 ? 'text-red-900 bg-red-50' : 'text-black'
            }`}
            required
          />
          {password && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="ml-2 text-gray-500 hover:text-gray-700 focus:outline-none"
              tabIndex={-1}
            >
              <Icon icon={showPassword ? "solar:eye-closed-bold" : "solar:eye-bold"} className="w-4 h-4" />
            </button>
          )}
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
          htmlFor="password_confirmation"
          className="text-sm text-blue-gray mb-3 px-0.5"
        >
          {t("auth.retypePassword")}
        </label>
        <div className="flex items-center border-2 border-[#E4E4E7] rounded-xl shadow-sm px-3 py-2">
          <input
            id="password_confirmation"
            name="password_confirmation"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            data-form-type="password"
            data-role="password-confirm"
            placeholder={t("auth.retypeYourPassword")}
            value={retypePassword}
            onChange={(e) => setRetypePassword(e.target.value)}
            className="w-full text-sm focus:outline-none placeholder:text-[#71717A] text-black"
            required
          />
          {retypePassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="ml-2 text-gray-500 hover:text-gray-700 focus:outline-none"
              tabIndex={-1}
            >
              <Icon icon={showPassword ? "solar:eye-closed-bold" : "solar:eye-bold"} className="w-4 h-4" />
            </button>
          )}
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
        <div style={{ direction: 'ltr' }} className="flex items-center phone-number-container">
          <CountryCodeSelect
            selectedCountryCode={countryCode}
            onCountryCodeChange={setCountryCode}
          />
          <div className={`flex-1 flex items-center border-2 border-l-0 rounded-r-xl shadow-sm px-3 py-2 ${
            phoneNumberError ? 'border-red-500 bg-red-50' : 'border-[#E4E4E7]'
          }`}>
            <input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              autoComplete="tel"
              placeholder={t("auth.enterPhoneNumber")}
              value={phoneNumber}
              onChange={handlePhoneNumberChange}
              className={`w-full text-sm focus:outline-none placeholder:text-[#71717A] text-left rtl:!text-left ${
                phoneNumberError ? 'text-red-900 bg-red-50' : 'text-black'
              }`}
              required
            />
          </div>
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
        disabled={!agreeToTerms || isCheckingWhatsApp}
        className="w-full bg-[#007AFF] text-white rounded-xl mt-4 text-sm font-medium disabled:opacity-50 py-5"
      >
        {isCheckingWhatsApp ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            {t("auth.checkingWhatsApp") || "Checking WhatsApp..."}
          </div>
        ) : (
          t("auth.next")
        )}
      </CustomButton>
    </form>
  );

  const renderStep2 = () => (
    <form onSubmit={handleStep2Submit} className="flex flex-col gap-4" name="registration-step2" data-form-type="signup">
      <div className="flex flex-col">
        <label
          htmlFor="companyName"
          className="text-sm text-blue-gray mb-3 px-0.5"
        >
          {t("auth.companyName")}
        </label>
        <div className="flex items-center border-2 border-[#E4E4E7] rounded-xl shadow-sm px-3 py-2">
          <input
            id="companyName"
            name="companyName"
            type="text"
            autoComplete="organization"
            placeholder={t("auth.enterCompanyName")}
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="w-full text-sm focus:outline-none placeholder:text-[#71717A] text-black"
            required
          />
        </div>
      </div>

      {/* <div className="flex flex-col">
        <label
          htmlFor="companyLicense"
          className="text-sm text-blue-gray mb-3 px-0.5"
        >
          {t("auth.companyLicense")} ({t("auth.optional")})
        </label>
        <div className="flex items-center border-2 border-[#E4E4E7] rounded-xl shadow-sm px-3 py-2">
          <input
            id="companyLicense"
            name="companyLicense"
            type="text"
            autoComplete="off"
            placeholder={t("auth.enterCompanyLicense")}
            value={companyLicense}
            onChange={(e) => setCompanyLicense(e.target.value)}
            className="w-full text-sm focus:outline-none placeholder:text-[#71717A] text-black"
          />
        </div>
      </div> */}

      {/* <div className="flex flex-col">
        <label
          htmlFor="description"
          className="text-sm text-blue-gray mb-3 px-0.5"
        >
          {t("auth.description")} ({t("auth.optional")})
        </label>
        <div className="flex items-center border-2 border-[#E4E4E7] rounded-xl shadow-sm px-3 py-2">
          <textarea
            id="description"
            name="description"
            autoComplete="off"
            placeholder={t("auth.enterDescription")}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full text-sm focus:outline-none placeholder:text-[#71717A] text-black min-h-[80px] resize-y"
            maxLength={1000}
          />
        </div>
        {description.length > 0 && (
          <p className="text-xs text-gray-500 mt-1 px-0.5">
            {description.length}/1000 {t("auth.characters")}
          </p>
        )}
      </div> */}

      {/* <div className="flex flex-col">
        <label
          htmlFor="locationName"
          className="text-sm text-blue-gray mb-3 px-0.5"
        >
          {t("auth.locationName")}
        </label>
        <div className="flex items-center border-2 border-[#E4E4E7] rounded-xl shadow-sm px-3 py-2">
          <input
            id="locationName"
            name="locationName"
            type="text"
            autoComplete="off"
            placeholder={t("auth.enterLocationName")}
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
            className="w-full text-sm focus:outline-none placeholder:text-[#71717A] text-black"
            required
          />
        </div>
      </div> */}

      <div className="flex flex-col">
        <label
          htmlFor="locationAddress"
          className="text-sm text-blue-gray mb-3 px-0.5"
        >
          {t("auth.locationAddress")}
        </label>
        <div className={`flex items-center border-2 rounded-xl shadow-sm px-3 py-2 ${
          selectedLocationData ? 'border-green-500 bg-green-50' : 'border-[#E4E4E7]'
        }`}>
          <input
            id="locationAddress"
            name="locationAddress"
            type="text"
            autoComplete="street-address"
            placeholder={t("auth.enterLocationAddress")}
            value={locationAddress}
            onChange={(e) => setLocationAddress(e.target.value)}
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
          <p className="text-green-600 text-xs mt-1 px-0.5 flex items-center gap-1">
            <Icon icon="solar:check-circle-bold" className="w-3 h-3" />
            {t("map.locationSelected")}: {selectedLocationData.name}
          </p>
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
          disabled={!agreeToTerms || isCheckingWhatsApp}
          className="flex-1 bg-[#007AFF] text-white rounded-xl text-sm font-medium disabled:opacity-50 cursor-pointer py-5"
        >
          {isCheckingWhatsApp ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              {t("auth.checkingWhatsApp") || "Checking WhatsApp..."}
            </div>
          ) : (
            t("auth.next")
          )}
        </CustomButton>
      </div>
    </form>
  );

  const renderStep3 = () => (
    <form onSubmit={handleStep3Submit} className="flex flex-col gap-4" name="registration-step3" data-form-type="signup">
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
                {t("brand.bringingSupplierToYourDoor")}
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

          {whatsAppError && (
            <div className="mb-4 p-3 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-lg text-sm flex items-start gap-2">
              <Icon icon="solar:phone-bold" className="text-yellow-600 text-lg mt-0.5 flex-shrink-0" />
              <div>
                <strong>WhatsApp Verification:</strong> {whatsAppError}
              </div>
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
