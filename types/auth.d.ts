declare module Auth {
  interface User {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    avatar: string | null;
    created_at: string;
    updated_at: string;
    address?: string;
  }

  interface Pharmacy {
    id: string;
    name: string;
    logo: string | null;
    rating: number;
    rating_count: number;
    account_id: string;
    created_at: string;
    updated_at: string;
    country_id: number;
    is_approved: boolean;
    country: Country;
    branches_count: number;
  }

  interface Country {
    id: number;
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
}