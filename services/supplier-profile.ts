import { apiClient } from "@/lib/api";
import { getAcceptLanguageHeader } from "@/lib/api";

/**
 * Service for managing supplier profile operations
 * Supports both modern nested format and legacy flat format for backward compatibility
 */

// Get supplier profile with branches
export async function getSupplierProfile(): Promise<Auth.ProfileResponse> {
  try {
    const response = await apiClient.get("/api/user", {
      headers: {
        'Accept-Language': getAcceptLanguageHeader(),
      }
    });

    // Handle different response formats - check if data is nested or direct
    const userData = response.data.data || response.data;
    
    // Ensure userData exists
    if (!userData) {
      throw new Error("No user data received from API");
    }
    
    const transformedResponse = {
      success: true,
      message: "Profile loaded successfully",
      data: {
        user: {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          phone_number: userData.phone_number || userData.phone,
          avatar: userData.avatar,
          created_at: userData.created_at || new Date().toISOString(),
          updated_at: userData.updated_at || new Date().toISOString(),
        },
        supplier: {
          id: userData.supplier?.id,
          name: userData.supplier?.name || userData.supplier_name,
          description: userData.supplier?.description || userData.supplier_description,
          logo: userData.supplier?.logo,
          country_id: userData.supplier?.country_id || userData.country_id,
          country: userData.supplier?.country,
          rating: userData.supplier?.rating || 0,
          rating_count: userData.supplier?.rating_count || 0,
          account_id: userData.supplier?.account_id || userData.id,
          created_at: userData.supplier?.created_at || new Date().toISOString(),
          updated_at: userData.supplier?.updated_at || new Date().toISOString(),
          has_branches: userData.supplier?.has_branches || false,
          is_approved: userData.supplier?.is_approved !== undefined ? userData.supplier.is_approved : false,
          branches_count: userData.supplier?.branches_count || (userData.branches?.length || 0),
        },
        // Include main branch info
        branch: userData.branch || {
          id: null,
          name: userData.branch_name,
          address: userData.branch_address,
          latitude: userData.branch_latitude,
          longitude: userData.branch_longitude,
          phone_number: userData.branch_phone_number,
        },
        // Extract branches from the userData directly (as shown in your response)
        branches: userData.branches || []
      }
    };

    return transformedResponse;
  } catch (error) {
    console.error("Error fetching supplier profile:", error);
    throw error;
  }
}

// Update supplier profile using modern nested format
export async function updateSupplierProfile(
  profileData: Auth.ProfileUpdateData
): Promise<any> {
  try {
    const formData = new FormData();
    
    // Add user fields
    if (profileData.name) formData.append("name", profileData.name);
    if (profileData.email) formData.append("email", profileData.email);
    if (profileData.phone_number) formData.append("phone_number", profileData.phone_number);
    if (profileData.password) formData.append("password", profileData.password);
    
    // For now, use legacy flat format since backend doesn't support nested yet
    if (profileData.supplier?.name) {
      formData.append("supplier_name", profileData.supplier.name);
    }
    if (profileData.supplier?.description) {
      formData.append("supplier_description", profileData.supplier.description);
    }
    if (profileData.supplier?.country_id) {
      formData.append("country_id", profileData.supplier.country_id);
    }
    if (profileData.supplier?.logo) {
      if (profileData.supplier.logo instanceof File) {
        formData.append("logo", profileData.supplier.logo);
      } else if (typeof profileData.supplier.logo === 'string') {
        formData.append("logo", profileData.supplier.logo);
      }
    }
    
    // Add branch fields as flat format for now
    if (profileData.branch?.name) {
      formData.append("branch_name", profileData.branch.name);
    }
    if (profileData.branch?.address) {
      formData.append("branch_address", profileData.branch.address);
    }
    if (profileData.branch?.latitude !== undefined) {
      formData.append("branch_latitude", profileData.branch.latitude.toString());
    }
    if (profileData.branch?.longitude !== undefined) {
      formData.append("branch_longitude", profileData.branch.longitude.toString());
    }
    if (profileData.branch?.phone_number) {
      formData.append("branch_phone_number", profileData.branch.phone_number);
    }
    
    // Add avatar file
    if (profileData.avatar) {
      if (profileData.avatar instanceof File) {
        formData.append("avatar", profileData.avatar);
      } else if (typeof profileData.avatar === 'string') {
        formData.append("avatar", profileData.avatar);
      }
    }

    // Use existing endpoint for now
    const response = await apiClient.post("/api/user", formData, {
      headers: {
        'Accept-Language': getAcceptLanguageHeader(),
        // Remove Content-Type header to let browser set multipart/form-data with boundary
        'Content-Type': undefined,
      }
    });

    return response.data;
  } catch (error) {
    console.error("Error updating supplier profile:", error);
    throw error;
  }
}

// Update supplier profile using legacy flat format (for backward compatibility)
export async function updateSupplierProfileLegacy(
  profileData: Auth.LegacyProfileUpdateData
): Promise<any> {
  try {
    const formData = new FormData();
    
    // Add all fields in flat format
    Object.entries(profileData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    const response = await apiClient.post("/api/user/profile", formData, {
      headers: {
        'Accept-Language': getAcceptLanguageHeader(),
        // Remove Content-Type header to let browser set multipart/form-data with boundary
        'Content-Type': undefined,
      }
    });

    return response.data;
  } catch (error) {
    console.error("Error updating supplier profile (legacy):", error);
    throw error;
  }
}

// Branch management services

// Get supplier branches
export async function getSupplierBranches(): Promise<Auth.SupplierBranch[]> {
  try {
    const response = await apiClient.get("/api/branches", {
      headers: {
        'Accept-Language': getAcceptLanguageHeader(),
      }
    });
    return response.data.data || response.data || [];
  } catch (error) {
    console.error("Error fetching supplier branches:", error);
    throw error;
  }
}

// Create a new supplier branch
export async function createSupplierBranch(branchData: Auth.BranchCreateData): Promise<Auth.SupplierBranch> {
  try {
    const response = await apiClient.post("/api/branches", branchData, {
      headers: {
        'Accept-Language': getAcceptLanguageHeader(),
      }
    });
    return response.data.data || response.data;
  } catch (error) {
    console.error("Error creating supplier branch:", error);
    throw error;
  }
}

// Update a supplier branch
export async function updateSupplierBranch(branchId: string, branchData: Auth.BranchUpdateData): Promise<Auth.SupplierBranch> {
  try {
    const response = await apiClient.put(`/api/branches/${branchId}`, branchData, {
      headers: {
        'Accept-Language': getAcceptLanguageHeader(),
      }
    });
    return response.data.data || response.data;
  } catch (error) {
    console.error("Error updating supplier branch:", error);
    throw error;
  }
}

// Delete a supplier branch
export async function deleteSupplierBranch(branchId: string): Promise<void> {
  try {
    await apiClient.delete(`/api/branches/${branchId}`, {
      headers: {
        'Accept-Language': getAcceptLanguageHeader(),
      }
    });
  } catch (error) {
    console.error("Error deleting supplier branch:", error);
    throw error;
  }
}

// Simple file validation function
export function validateProfileFiles(files: { [key: string]: File }): string[] {
  const errors: string[] = [];
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  Object.entries(files).forEach(([key, file]) => {
    if (!allowedTypes.includes(file.type)) {
      errors.push(`${key} must be a valid image file (JPEG, PNG, GIF, WebP)`);
    }
    
    const sizeMB = Math.round(file.size / (1024 * 1024) * 100) / 100;
    if (file.size > maxSize) {
      errors.push(`${key} must be smaller than 5MB`);
    }
  });
  
  return errors;
}
