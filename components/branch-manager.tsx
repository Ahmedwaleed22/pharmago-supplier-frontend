"use client";

import React, { useState, useEffect } from "react";
import { PlusIcon, EditIcon, TrashIcon, MapPinIcon, PhoneIcon } from "lucide-react";
import { useTranslation } from "@/contexts/i18n-context";
import CustomButton from "@/components/custom-button";
import {
  getSupplierBranches,
  createSupplierBranch,
  updateSupplierBranch,
  deleteSupplierBranch,
} from "@/services/supplier-profile";

interface BranchManagerProps {
  onBranchUpdate?: () => void;
}

interface FormErrors {
  name?: string;
  address?: string;
  latitude?: string;
  longitude?: string;
  phone_number?: string;
  general?: string;
}

const BranchManager: React.FC<BranchManagerProps> = ({ onBranchUpdate }) => {
  const { t, isRtl } = useTranslation();
  
  const [branches, setBranches] = useState<Auth.SupplierBranch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Auth.SupplierBranch | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  
  const [formData, setFormData] = useState<Auth.BranchCreateData>({
    name: "",
    address: "",
    latitude: "",
    longitude: "",
    phone_number: "",
  });

  // Load branches on component mount
  useEffect(() => {
    loadBranches();
  }, []);

  const loadBranches = async () => {
    try {
      setIsLoading(true);
      const branchesData = await getSupplierBranches();
      setBranches(branchesData);
    } catch (error) {
      console.error("Error loading branches:", error);
      setErrors({ general: t("branches.loadError") });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof Auth.BranchCreateData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = t("branches.nameRequired");
    }

    if (!formData.address.trim()) {
      newErrors.address = t("branches.addressRequired");
    }

    if (!formData.phone_number.trim()) {
      newErrors.phone_number = t("branches.phoneRequired");
    }

    // Validate coordinates if provided
    if (formData.latitude && (isNaN(Number(formData.latitude)) || Number(formData.latitude) < -90 || Number(formData.latitude) > 90)) {
      newErrors.latitude = t("branches.invalidLatitude");
    }

    if (formData.longitude && (isNaN(Number(formData.longitude)) || Number(formData.longitude) < -180 || Number(formData.longitude) > 180)) {
      newErrors.longitude = t("branches.invalidLongitude");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const openCreateModal = () => {
    setEditingBranch(null);
    setFormData({
      name: "",
      address: "",
      latitude: "",
      longitude: "",
      phone_number: "",
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (branch: Auth.SupplierBranch) => {
    setEditingBranch(branch);
    setFormData({
      name: branch.name,
      address: branch.address,
      latitude: branch.latitude.toString(),
      longitude: branch.longitude.toString(),
      phone_number: branch.phone_number,
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      if (editingBranch) {
        // Update existing branch
        await updateSupplierBranch(editingBranch.id, formData);
      } else {
        // Create new branch
        await createSupplierBranch(formData);
      }

      setIsModalOpen(false);
      await loadBranches();
      onBranchUpdate?.();
    } catch (error: any) {
      console.error("Error saving branch:", error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({ general: t("branches.saveError") });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (branchId: string) => {
    if (!confirm(t("branches.deleteConfirmation"))) return;

    try {
      await deleteSupplierBranch(branchId);
      await loadBranches();
      onBranchUpdate?.();
    } catch (error) {
      console.error("Error deleting branch:", error);
      setErrors({ general: t("branches.deleteError") });
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-blue-gray">
          {t("branches.title")}
        </h3>
        <CustomButton
          onClick={openCreateModal}
          className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          <PlusIcon className="w-4 h-4" />
          <span>{t("branches.addBranch")}</span>
        </CustomButton>
      </div>

      {errors.general && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {errors.general}
        </div>
      )}

      <div className="space-y-4">
        {branches.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MapPinIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>{t("branches.noBranches")}</p>
            <p className="text-sm">{t("branches.addFirstBranch")}</p>
          </div>
        ) : (
          branches.map((branch) => (
            <div key={branch.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-blue-gray mb-2">{branch.name}</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <MapPinIcon className="w-4 h-4" />
                      <span>{branch.address}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <PhoneIcon className="w-4 h-4" />
                      <span>{branch.phone_number}</span>
                    </div>
                    {(branch.latitude && branch.longitude) && (
                      <div className="text-xs text-gray-500">
                        {t("branches.coordinates")}: {branch.latitude}, {branch.longitude}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => openEditModal(branch)}
                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                    title={t("common.edit")}
                  >
                    <EditIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(branch.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title={t("common.delete")}
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal for Create/Edit Branch */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {editingBranch ? t("branches.editBranch") : t("branches.addBranch")}
            </h3>

            {errors.general && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {errors.general}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("branches.branchName")}
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder={t("branches.enterBranchName")}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("branches.address")}
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.address ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder={t("branches.enterAddress")}
                  rows={2}
                />
                {errors.address && (
                  <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("branches.phoneNumber")}
                </label>
                <input
                  type="tel"
                  value={formData.phone_number}
                  onChange={(e) => handleInputChange("phone_number", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.phone_number ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder={t("branches.enterPhoneNumber")}
                />
                {errors.phone_number && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone_number}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("branches.latitude")}
                  </label>
                  <input
                    type="text"
                    value={formData.latitude}
                    onChange={(e) => handleInputChange("latitude", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.latitude ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="25.0760"
                  />
                  {errors.latitude && (
                    <p className="text-red-500 text-sm mt-1">{errors.latitude}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("branches.longitude")}
                  </label>
                  <input
                    type="text"
                    value={formData.longitude}
                    onChange={(e) => handleInputChange("longitude", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.longitude ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="55.1320"
                  />
                  {errors.longitude && (
                    <p className="text-red-500 text-sm mt-1">{errors.longitude}</p>
                  )}
                </div>
              </div>

              <p className="text-xs text-gray-500">
                {t("branches.coordinatesOptional")}
              </p>
            </div>

            <div className="flex items-center justify-end space-x-3 mt-6">
              <CustomButton
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={isSaving}
              >
                {t("common.cancel")}
              </CustomButton>
              <CustomButton
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                disabled={isSaving}
              >
                {isSaving ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>{t("common.saving")}</span>
                  </div>
                ) : (
                  t("common.save")
                )}
              </CustomButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BranchManager;
