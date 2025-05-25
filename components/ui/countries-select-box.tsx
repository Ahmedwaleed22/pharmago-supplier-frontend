import { Autocomplete, AutocompleteItem, Avatar } from "@heroui/react";
import { useTranslation } from "@/contexts/i18n-context";

function CountriesSelectBox({
  countries,
  onChange,
  selectedCountry,
}: {
  countries: Countries.Country[];
  onChange: (e: any) => void;
  selectedCountry: number | null;
}) {
  const { t } = useTranslation();

  return (
    <Autocomplete
      variant="bordered"
      className="max-w-xs h-[40px] rounded-xl shadow-sm"
      placeholder={t("auth.selectYourCountry")}
      selectedKey={selectedCountry}
      onSelectionChange={onChange}
    >
      {countries.map((country) => (
        <AutocompleteItem
          key={country.id}
          startContent={
            <Avatar
              alt={country.name}
              className="w-6 h-6"
              src={`https://flagcdn.com/${country.iso2.toLowerCase()}.svg`}
            />
          }
        >
          {country.name}
        </AutocompleteItem>
      ))}
    </Autocomplete>
  );
}

export default CountriesSelectBox;
