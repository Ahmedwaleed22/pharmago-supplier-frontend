import axios from "axios";

export async function getCountries(language: string): Promise<Countries.Country[]> {
  // Use our internal API route which will handle auth token properly
  const response = await axios.get('/api/countries', {
    headers: {
      'Accept-Language': language,
    }
  });

  if (response.status !== 200) {
    throw new Error('Failed to fetch countries');
  }
  
  return response.data as Countries.Country[];
}

export interface CountryPhoneCode {
  id: string;
  name: string;
  iso2: string;
  phone_code: string;
}

export async function getCountryPhoneCodes(language: string): Promise<CountryPhoneCode[]> {
  // Use our internal API route which will handle auth token properly
  const response = await axios.get('/api/countries/phone-codes', {
    headers: {
      'Accept-Language': language,
    }
  });

  if (response.status !== 200) {
    throw new Error('Failed to fetch country phone codes');
  }
  
  return response.data as CountryPhoneCode[];
}

export interface CountryDetectionResult {
  country_code: string;
  method: 'ip-geolocation' | 'language-fallback' | 'fallback';
  error?: string;
}

export async function detectUserCountry(): Promise<CountryDetectionResult> {
  try {
    const response = await axios.get('/api/countries/detect');
    
    if (response.status !== 200) {
      throw new Error('Failed to detect user country');
    }
    
    return response.data as CountryDetectionResult;
  } catch (error) {
    console.error('Country detection failed:', error);
    // Return fallback
    return {
      country_code: 'US',
      method: 'fallback',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}