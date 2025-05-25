"use client";

import React, { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { Icon } from "@iconify/react/dist/iconify.js";
import CustomButton from "./custom-button";
import { useTranslation } from "@/contexts/i18n-context";

interface Location {
  name: string;
  lat: number;
  lng: number;
  address: string;
}

interface GoogleMapPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (location: Location) => void;
  apiKey: string;
  initialLocation?: { lat: number; lng: number };
}

const GoogleMapPicker: React.FC<GoogleMapPickerProps> = ({
  isOpen,
  onClose,
  onLocationSelect,
  apiKey,
  initialLocation = { lat: 40.7128, lng: -74.006 }, // Default to NYC
}) => {
  const { t } = useTranslation();
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [geocoder, setGeocoder] = useState<google.maps.Geocoder | null>(null);
  const [places, setPlaces] = useState<google.maps.places.PlacesService | null>(
    null
  );
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );
  const [searchInput, setSearchInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  useEffect(() => {
    if (!isOpen || !apiKey) return;

    const loader = new Loader({
      apiKey: apiKey,
      version: "weekly",
      libraries: ["places", "geocoding"],
    });

    loader
      .load()
      .then(() => {
        if (mapRef.current) {
          const mapInstance = new google.maps.Map(mapRef.current, {
            center: initialLocation,
            zoom: 13,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
          });

          const markerInstance = new google.maps.Marker({
            position: initialLocation,
            map: mapInstance,
            draggable: true,
            title: t("map.selectLocation"),
          });

          const geocoderInstance = new google.maps.Geocoder();
          const placesInstance = new google.maps.places.PlacesService(
            mapInstance
          );

          setMap(mapInstance);
          setMarker(markerInstance);
          setGeocoder(geocoderInstance);
          setPlaces(placesInstance);
          setIsLoading(false);

          // Handle map clicks
          mapInstance.addListener(
            "click",
            (event: google.maps.MapMouseEvent) => {
              if (event.latLng) {
                const position = event.latLng;
                markerInstance.setPosition(position);
                reverseGeocode(position);
              }
            }
          );

          // Handle marker drag
          markerInstance.addListener("dragend", () => {
            const position = markerInstance.getPosition();
            if (position) {
              reverseGeocode(position);
            }
          });

          // Initial reverse geocoding
          reverseGeocode(
            new google.maps.LatLng(initialLocation.lat, initialLocation.lng)
          );
        }
      })
      .catch((error) => {
        console.error("Error loading Google Maps:", error);
        setIsLoading(false);
      });
  }, [isOpen, apiKey, initialLocation]);

  const reverseGeocode = (position: google.maps.LatLng) => {
    if (!geocoder) return;

    geocoder.geocode({ location: position }, (results, status) => {
      if (status === "OK" && results && results[0]) {
        const result = results[0];
        const location: Location = {
          name: result.formatted_address.split(",")[0], // Get the first part as name
          lat: position.lat(),
          lng: position.lng(),
          address: result.formatted_address,
        };
        setSelectedLocation(location);
      }
    });
  };

  const searchLocation = () => {
    if (!places || !map || !searchInput.trim()) return;

    const request = {
      query: searchInput,
      fields: ["name", "geometry", "formatted_address"],
    };

    places.textSearch(request, (results, status) => {
      if (
        status === google.maps.places.PlacesServiceStatus.OK &&
        results &&
        results[0]
      ) {
        const place = results[0];
        if (place.geometry?.location) {
          const position = place.geometry.location;
          map.setCenter(position);
          map.setZoom(15);

          if (marker) {
            marker.setPosition(position);
          }

          const location: Location = {
            name:
              place.name ||
              place.formatted_address?.split(",")[0] ||
              t("map.selectedLocation"),
            lat: position.lat(),
            lng: position.lng(),
            address: place.formatted_address || "",
          };
          setSelectedLocation(location);
        }
      }
    });
  };

  const handleConfirm = () => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation);
      onClose();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      searchLocation();
    }
  };

  const getLocationFromIP = async () => {
    try {
      const response = await fetch("https://ipapi.co/json/");
      const data = await response.json();

      if (data.latitude && data.longitude) {
        return {
          lat: parseFloat(data.latitude),
          lng: parseFloat(data.longitude),
        };
      }
    } catch (error) {
      console.error("Error getting IP location:", error);
    }

    return null;
  };

  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      // Try IP location if geolocation is not supported
      setIsGettingLocation(true);
      const ipLocation = await getLocationFromIP();

      if (ipLocation && map && marker) {
        map.setCenter(ipLocation);
        map.setZoom(13);
        marker.setPosition(ipLocation);
        reverseGeocode(new google.maps.LatLng(ipLocation.lat, ipLocation.lng));
      } else {
        alert(t("map.unableToGetLocationManual"));
      }

      setIsGettingLocation(false);
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const currentPos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        if (map && marker) {
          map.setCenter(currentPos);
          map.setZoom(15);
          marker.setPosition(currentPos);
          reverseGeocode(
            new google.maps.LatLng(currentPos.lat, currentPos.lng)
          );
        }
        setIsGettingLocation(false);
      },
      async (error) => {
        console.error("Error getting GPS location:", error);

        // Fallback to IP location
        const ipLocation = await getLocationFromIP();

        if (ipLocation && map && marker) {
          map.setCenter(ipLocation);
          map.setZoom(13);
          marker.setPosition(ipLocation);
          reverseGeocode(
            new google.maps.LatLng(ipLocation.lat, ipLocation.lng)
          );
        } else {
          alert(t("map.unableToGetLocationManual"));
        }

        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">
            {t("map.selectLocation")}
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Icon icon="ph:x" className="h-6 w-6 text-gray-600" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder={t("map.searchPlaceholder")}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={searchLocation}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Icon icon="ph:magnifying-glass" className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="text-gray-600">{t("map.loadingMap")}</div>
            </div>
          )}
          <div ref={mapRef} className="w-full h-full" />
        </div>

        {/* Selected Location Info */}
        {selectedLocation && (
          <div className="p-4 border-t bg-gray-50">
            <div className="mb-2">
              <h4 className="font-medium text-gray-800">
                {selectedLocation.name}
              </h4>
              <p className="text-sm text-gray-600">
                {selectedLocation.address}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {t("map.coordinates")}: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t">
          <CustomButton
            onClick={getCurrentLocation}
            disabled={isGettingLocation}
            className="bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-green-300 transition-colors flex items-center justify-center gap-1"
          >
            {isGettingLocation ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                {t("map.gettingLocation")}
              </>
            ) : (
              <>
                <Icon icon="ph:gps-light" className="h-4 w-4" />
                {t("map.useMyLocation")}
              </>
            )}
          </CustomButton>
          <CustomButton
            onClick={onClose}
            className="px-4 py-2 bg-white text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
{t("common.cancel")}
          </CustomButton>
          <CustomButton
            onClick={handleConfirm}
            disabled={!selectedLocation}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
{t("map.confirmLocation")}
          </CustomButton>
        </div>
      </div>
    </div>
  );
};

export default GoogleMapPicker;
