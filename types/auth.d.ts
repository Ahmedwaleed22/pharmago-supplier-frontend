declare module Auth {
  interface User {
    id: string;
    name: string;
    email: string;
    phone_number?: string | null;
    phone?: string | null;
    avatar: string | null;
    created_at: string;
    updated_at: string;
    address?: string;
    account_type?: string;
  }

  interface Pharmacy {
    id: string;
    name: string;
    description?: string | null;
    logo: string | null;
    rating: number;
    rating_count: number;
    account_id: string;
    created_at: string;
    updated_at: string;
    country_id: number | string;
    is_approved: boolean;
    country: Country;
    branches_count: number;
  }

  interface PharmacyBranch {
    id: string;
    pharmacy_id: string;
    name: string;
    address: string;
    latitude: string | number;
    longitude: string | number;
    phone_number: string;
    created_at?: string;
    updated_at?: string;
  }

  interface Country {
    id: number | string;
    iso2: string;
    name: string;
    status: number;
    phone_code: string;
    iso3: string;
    region: string;
    subregion: string;
    currency_id: number | null;
    currency: Currency;
  }

  interface Currency {
    id: number;
    code: string;
    symbol: string;
    name?: string;
  }

  interface LoginCredentials {
    email: string;
    password: string;
    remember?: boolean;
  }

  interface LoginResponse {
    token: string;
    pharmacy: Pharmacy;
    user: User;
    message?: string;
  }

  // Profile Management Types
  interface ProfileResponse {
    data: {
      user: User;
      pharmacy: Pharmacy;
      branch: PharmacyBranch;
      branches: PharmacyBranch[];
    };
  }

  // Modern nested format for profile updates
  interface ProfileUpdateData {
    name?: string;
    email?: string;
    phone_number?: string;
    password?: string;
    avatar?: File | string;
    pharmacy?: {
      name?: string;
      description?: string;
      country_id?: string;
      logo?: File | string;
    };
    branch?: {
      name?: string;
      address?: string;
      latitude?: string | number;
      longitude?: string | number;
      phone_number?: string;
    };
  }

  // Legacy flat format for backward compatibility
  interface LegacyProfileUpdateData {
    name?: string;
    email?: string;
    phone_number?: string;
    password?: string;
    password_confirmation?: string;
    pharmacy_name?: string;
    pharmacy_description?: string;
    country_id?: string;
    branch_name?: string;
    branch_address?: string;
    branch_latitude?: string | number;
    branch_longitude?: string | number;
    branch_phone_number?: string;
    logo?: File | string;
    avatar?: File | string;
  }

  // Branch Management Types
  interface BranchCreateData {
    name: string;
    address: string;
    latitude: string | number;
    longitude: string | number;
    phone_number: string;
  }

  interface BranchUpdateData {
    name?: string;
    address?: string;
    latitude?: string | number;
    longitude?: string | number;
    phone_number?: string;
  }
}