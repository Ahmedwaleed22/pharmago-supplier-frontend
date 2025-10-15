"use client";

import React from "react";
import { Trash2, Plus } from "lucide-react";
import { useTranslation } from "@/contexts/i18n-context";
import { useI18n } from "@/contexts/i18n-context";
import { cn } from "@/lib/utils";

export interface PriceTier {
  id: string;
  min_quantity: string;
  max_quantity: string;
  operator: "range" | "plus"; // "range" for min-max, "plus" for min+
  price: string;
}

interface PriceTierInputProps {
  tiers: PriceTier[];
  onChange: (tiers: PriceTier[]) => void;
  currency?: string;
}

function PriceTierInput({ tiers, onChange, currency = "LE" }: PriceTierInputProps) {
  const { t } = useTranslation();
  const { isRtl } = useI18n();

  const addTier = () => {
    const newTier: PriceTier = {
      id: Date.now().toString(),
      min_quantity: "",
      max_quantity: "",
      operator: "range",
      price: "",
    };
    onChange([...tiers, newTier]);
  };

  const removeTier = (id: string) => {
    onChange(tiers.filter((tier) => tier.id !== id));
  };

  const updateTier = (id: string, field: keyof PriceTier, value: string) => {
    onChange(
      tiers.map((tier) =>
        tier.id === id ? { ...tier, [field]: value } : tier
      )
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-[#414651]">
          {t('products.priceTiers')}
        </label>
        <button
          type="button"
          onClick={addTier}
          className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-[#2970ff] hover:bg-blue-50 rounded-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t('products.addTier')}
        </button>
      </div>

      {tiers.length > 0 && (
        <div className="space-y-3">
          {tiers.map((tier, index) => (
            <div
              key={tier.id}
              className="flex items-center gap-2 p-3 bg-white rounded-lg border border-gray-200"
            >
              {/* Tier Number */}
              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-[#2970ff] text-white rounded-full text-sm font-semibold">
                {index + 1}
              </div>

              {/* Min Quantity */}
              <div className="flex-1">
                <input
                  type="text"
                  value={tier.min_quantity}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Allow only numbers
                    if (/^\d*$/.test(value)) {
                      updateTier(tier.id, "min_quantity", value);
                    }
                  }}
                  placeholder={t('products.minQty')}
                  className={cn(
                    "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2970ff] focus:border-transparent",
                    isRtl ? "text-right" : "text-left"
                  )}
                />
              </div>

              {/* Operator Dropdown */}
              <div className="flex-shrink-0">
                <select
                  value={tier.operator}
                  onChange={(e) =>
                    updateTier(tier.id, "operator", e.target.value as "range" | "plus")
                  }
                  className={cn(
                    "px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2970ff] focus:border-transparent cursor-pointer bg-white",
                    isRtl ? "text-right" : "text-left"
                  )}
                >
                  <option value="range">-</option>
                  <option value="plus">+</option>
                </select>
              </div>

              {/* Max Quantity (only shown for range operator) */}
              {tier.operator === "range" && (
                <div className="flex-1">
                  <input
                    type="text"
                    value={tier.max_quantity}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Allow only numbers
                      if (/^\d*$/.test(value)) {
                        updateTier(tier.id, "max_quantity", value);
                      }
                    }}
                    placeholder={t('products.maxQty')}
                    className={cn(
                      "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2970ff] focus:border-transparent",
                      isRtl ? "text-right" : "text-left"
                    )}
                  />
                </div>
              )}

              {/* Equals sign */}
              <div className="flex-shrink-0 text-gray-500 font-semibold">=</div>

              {/* Price */}
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={tier.price}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Allow numbers and up to 2 decimal places
                    if (/^\d*\.?\d{0,2}$/.test(value)) {
                      updateTier(tier.id, "price", value);
                    }
                  }}
                  placeholder={t('products.price')}
                  className={cn(
                    "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2970ff] focus:border-transparent",
                    isRtl ? "text-right pr-12" : "text-left pl-3"
                  )}
                />
                <span className={cn(
                  "absolute top-1/2 -translate-y-1/2 text-gray-500 text-sm",
                  isRtl ? "left-3" : "right-3"
                )}>
                  {currency}
                </span>
              </div>

              {/* Delete Button */}
              <button
                type="button"
                onClick={() => removeTier(tier.id)}
                className="flex-shrink-0 p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                title={t('common.delete')}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {tiers.length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500 text-sm mb-3">
            {t('products.noPriceTiers')}
          </p>
          <button
            type="button"
            onClick={addTier}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-[#2970ff] hover:bg-blue-600 rounded-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t('products.addFirstTier')}
          </button>
        </div>
      )}

      {/* Helper Text */}
      {tiers.length > 0 && (
        <p className="text-xs text-gray-500">
          {t('products.priceTiersHelp')}
        </p>
      )}
    </div>
  );
}

export default PriceTierInput;

