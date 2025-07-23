"use client";

import React, { useState, useEffect } from "react";
import { PlusIcon, EditIcon, TrashIcon, MapPinIcon, PhoneIcon } from "lucide-react";
import { useTranslation } from "@/contexts/i18n-context";
import CustomButton from "@/components/custom-button";
import Breadcrumb from "@/components/ui/breadcrumb";
import {
  getPharmacyBranches,
  createPharmacyBranch,
  updatePharmacyBranch,
  deletePharmacyBranch,
} from "@/services/pharmacy-profile";
import { useRouter } from "next/navigation";

const BranchManagementPage: React.FC = () => {
  const { t, isRtl } = useTranslation();
  const router = useRouter();
  
  const [branches, setBranches] = useState<Auth.PharmacyBranch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load branches on component mount
  useEffect(() => {
    loadBranches();
  }, []);

  const loadBranches = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const branchData = await getPharmacyBranches();
      setBranches(branchData);
    } catch (error: any) {
      console.error("Error loading branches:", error);
      setError(error.message || "Failed to load branches");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddBranch = () => {
    router.push("/dashboard/branches/add");
  };

  const handleEditBranch = (branchId: string) => {
    router.push(`/dashboard/branches/edit/${branchId}`);
  };

  const handleDeleteBranch = async (branchId: string, branchName: string) => {
    if (!confirm(t("branches.confirmDelete").replace("{name}", branchName))) {
      return;
    }

    try {
      await deletePharmacyBranch(branchId);
      // Reload branches after deletion
      await loadBranches();
    } catch (error: any) {
      console.error("Error deleting branch:", error);
      alert(error.message || "Failed to delete branch");
    }
  };

  // Loading skeleton
  const BranchSkeleton = () => (
    <div className="bg-white rounded-lg p-6 border shadow-sm animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="h-6 bg-gray-200 rounded w-48"></div>
        <div className="flex space-x-2">
          <div className="h-8 bg-gray-200 rounded w-16"></div>
          <div className="h-8 bg-gray-200 rounded w-16"></div>
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="py-8">
        <Breadcrumb
          items={[
            { label: t("breadcrumbs.dashboard"), href: "/dashboard" },
            { label: t("breadcrumbs.branches"), href: "/dashboard/branches" },
          ]}
        />

        <div className="flex justify-between items-center mt-6 mb-8">
          <div>
            <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mt-2 animate-pulse"></div>
          </div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>

        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <BranchSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <Breadcrumb
        items={[
          { label: t("breadcrumbs.dashboard"), href: "/dashboard" },
          { label: t("breadcrumbs.branches"), href: "/dashboard/branches" },
        ]}
      />

      <div className="flex justify-between items-center mt-6 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-blue-gray">{t("branches.title")}</h1>
          <p className="text-gray-600 mt-1">{t("branches.description")}</p>
        </div>
        <CustomButton
          onClick={handleAddBranch}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
        >
          <PlusIcon className="w-4 h-4" />
          <span>{t("branches.addBranch")}</span>
        </CustomButton>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {branches.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPinIcon className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t("branches.noBranches")}
          </h3>
          <p className="text-gray-500 mb-6">
            {t("branches.noBranchesDescription")}
          </p>
          <CustomButton
            onClick={handleAddBranch}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors inline-flex items-center space-x-2"
          >
            <PlusIcon className="w-5 h-5" />
            <span>{t("branches.addFirstBranch")}</span>
          </CustomButton>
        </div>
      ) : (
        <div className="space-y-6">
          {branches.map((branch) => (
            <div key={branch.id} className="bg-white rounded-lg p-6 border shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-blue-gray mb-1">
                    {branch.name}
                  </h3>
                  <div className="flex items-center text-gray-600 text-sm mb-2">
                    <MapPinIcon className="w-4 h-4 mr-1" />
                    <span>{branch.address}</span>
                  </div>
                  {branch.phone_number && (
                    <div className="flex items-center text-gray-600 text-sm">
                      <PhoneIcon className="w-4 h-4 mr-1" />
                      <span>{branch.phone_number}</span>
                    </div>
                  )}
                </div>
                <div className="flex space-x-2">
                  <CustomButton
                    onClick={() => handleEditBranch(branch.id)}
                    className="text-blue-600 hover:text-blue-800 px-3 py-1 text-sm font-medium border border-blue-200 hover:bg-blue-50 rounded-md transition-colors flex items-center space-x-1"
                  >
                    <EditIcon className="w-3 h-3" />
                    <span>{t("common.edit")}</span>
                  </CustomButton>
                  <CustomButton
                    onClick={() => handleDeleteBranch(branch.id, branch.name)}
                    className="text-red-600 hover:text-red-800 px-3 py-1 text-sm font-medium border border-red-200 hover:bg-red-50 rounded-md transition-colors flex items-center space-x-1"
                  >
                    <TrashIcon className="w-3 h-3" />
                    <span>{t("common.delete")}</span>
                  </CustomButton>
                </div>
              </div>
              
              {(branch.latitude && branch.longitude) && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="text-sm text-gray-600">
                    <strong>{t("branches.coordinates")}:</strong>{" "}
                    {parseFloat(branch.latitude.toString()).toFixed(6)}, {parseFloat(branch.longitude.toString()).toFixed(6)}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BranchManagementPage; 