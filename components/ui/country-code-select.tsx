import { Select, SelectItem } from "@heroui/react";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useTranslation } from "@/contexts/i18n-context";
import { getCountryPhoneCodes, CountryPhoneCode, detectUserCountry } from "@/services/countries";

// Helper function to get country flag emoji from ISO2 code
const getCountryFlag = (iso2: string | undefined): string => {
  if (!iso2 || iso2.length !== 2) return '🏳️';
  
  // Convert ISO2 code to flag emoji using Unicode regional indicator symbols
  const upperIso2 = iso2.toUpperCase();
  
  // Convert each letter to its corresponding regional indicator symbol
  const firstChar = String.fromCodePoint(0x1F1E6 + upperIso2.charCodeAt(0) - 65);
  const secondChar = String.fromCodePoint(0x1F1E6 + upperIso2.charCodeAt(1) - 65);
  
  return firstChar + secondChar;
};

interface CountryCodeSelectProps {
  selectedCountryCode: string;
  onCountryCodeChange: (dialCode: string) => void;
  className?: string;
}

export default function CountryCodeSelect({
  selectedCountryCode,
  onCountryCodeChange,
  className = "",
}: CountryCodeSelectProps) {
  const [countries, setCountries] = useState<CountryPhoneCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasAutoDetected, setHasAutoDetected] = useState(false);
  const { locale } = useTranslation();

  // Memoize selected country and fallback to prevent unnecessary recalculations
  const { selectedCountry, fallbackCountry, selectedKey } = useMemo(() => {
    const selected = countries.find(
      (country) => `+${country.phone_code}` === selectedCountryCode
    );
    
    // Fallback to US specifically, not just any country with phone code 1
    const fallback = countries.find(c => c.iso2 === 'US');
    const key = selected?.iso2 || fallback?.iso2 || "";
    
    return {
      selectedCountry: selected,
      fallbackCountry: fallback,
      selectedKey: key
    };
  }, [countries, selectedCountryCode]);

  // Memoize the selection change handler
  const handleSelectionChange = useCallback((keys: any) => {
    const selectedIso2 = Array.from(keys)[0] as string;
    const country = countries.find(c => c.iso2 === selectedIso2);
    if (country) {
      onCountryCodeChange(`+${country.phone_code}`);
    }
  }, [countries, onCountryCodeChange]);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setLoading(true);
        const data = await getCountryPhoneCodes(locale);
        // Remove duplicates with preference for US when phone codes are the same
        const phoneCodeGroups = new Map<string, CountryPhoneCode[]>();
        
        // Group countries by phone code
        data.forEach(country => {
          const phoneCode = country.phone_code;
          if (!phoneCodeGroups.has(phoneCode)) {
            phoneCodeGroups.set(phoneCode, []);
          }
          phoneCodeGroups.get(phoneCode)!.push(country);
        });
        
        // For each phone code group, prefer US if it exists, otherwise take the first
        const uniqueCountries = Array.from(phoneCodeGroups.values()).map(group => {
          const usCountry = group.find(c => c.iso2 === 'US');
          const selected = usCountry || group[0];
          
          // Ensure US is selected for phone code 1
          if (group.some(c => c.phone_code === '1') && selected.iso2 !== 'US') {
            console.warn('Phone code 1 group did not select US:', `${selected.iso2}:${selected.name}`);
          }
          
          return selected;
        });
        
        // Sort countries with US first, then alphabetically
        const sortedCountries = uniqueCountries.sort((a, b) => {
          if (a.iso2 === 'US') return -1;
          if (b.iso2 === 'US') return 1;
          return a.name.localeCompare(b.name);
        });
        
        setCountries(sortedCountries);
      } catch (error) {
        console.error("Failed to fetch country phone codes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCountries();
  }, [locale]);

  // Separate effect for auto-detection  
  useEffect(() => {
    const autoDetectCountry = async () => {
      // Only auto-detect if we haven't done it yet, no country is selected, and countries are loaded
      if (!hasAutoDetected && !selectedCountryCode && countries.length > 0) {
        try {
          const detectionResult = await detectUserCountry();
          const detectedCountry = countries.find(c => c.iso2 === detectionResult.country_code);
          
          if (detectedCountry) {
            // Auto-select the detected country
            onCountryCodeChange(`+${detectedCountry.phone_code}`);
          } else {
            // Fallback to US if detected country not found
            const usCountry = countries.find(c => c.iso2 === 'US');
            if (usCountry) {
              onCountryCodeChange(`+${usCountry.phone_code}`);
            }
          }
          setHasAutoDetected(true);
        } catch (error) {
          console.error("Failed to detect user country:", error);
          // Fallback to US on error
          const usCountry = countries.find(c => c.iso2 === 'US');
          if (usCountry) {
            onCountryCodeChange(`+${usCountry.phone_code}`);
          }
          setHasAutoDetected(true);
        }
      }
    };

    autoDetectCountry();
  }, [countries, hasAutoDetected, selectedCountryCode]);

  if (loading || (!hasAutoDetected && !selectedCountryCode)) {
    return (
      <div className={`w-25 h-10 border-2 border-[#E4E4E7] bg-[#F4F4F5] shadow-sm rounded-xl rounded-r-none animate-pulse ${className}`} />
    );
  }

  return (
    <Select
      variant="bordered"
      selectedKeys={[selectedKey]}
      onSelectionChange={handleSelectionChange}
      className={`w-25 ${className}`}
      classNames={{
        trigger: "border-2 border-[#E4E4E7] rounded-l-xl rounded-r-none shadow-sm min-h-[40px] border-r-0 outline-none focus:outline-none focus:ring-0 focus:border-[#E4E4E7] focus-visible:outline-none focus-visible:ring-0 focus-within:outline-none [&:focus]:outline-none [&:focus-visible]:outline-none [&:focus-visible]:ring-0",
        value: "text-sm",
        popoverContent: "border border-[#E4E4E7]",
      }}
      placeholder="🇺🇸 +1"
      size="sm"
      aria-label="Country code"
      renderValue={(items) => {
        return items.map((item) => {
          const country = countries.find(c => c.iso2 === item.key);
          return (
            <div key={item.key} className="flex items-center gap-1">
              <span className="text-lg">{getCountryFlag(country?.iso2)}</span>
              <span>+{country?.phone_code}</span>
            </div>
          );
        });
      }}
    >
      {countries.map((country) => (
        <SelectItem
          key={country.iso2}
          textValue={`${country.name} +${country.phone_code}`}
          startContent={
            <span className="text-lg">{getCountryFlag(country.iso2)}</span>
          }
        >
          +{country.phone_code}
        </SelectItem>
      ))}
    </Select>
  );
} 