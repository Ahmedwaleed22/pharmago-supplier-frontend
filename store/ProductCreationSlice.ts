import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ProductImage {
  name?: string;
  url: string;
  isPrimary: boolean;
  size?: number;
}

export interface PriceTier {
  id: string;
  min_quantity: string;
  max_quantity: string;
  operator: "range" | "plus";
  price: string;
}

export interface ProductState {
  name: string;
  subName: string;
  notes: string;
  category: string;
  subCategory: string;
  supplierLogo: string;
  productDetails: string;
  price: string;
  discount: string;
  stock: string;
  tag: string;
  tagColor: string;
  image: string; // Keep for backward compatibility
  images: ProductImage[]; // New field for multiple images
  priceTiers: PriceTier[]; // Price tier configuration
}

const initialState: ProductState = {
  name: "",
  subName: "",
  notes: "",
  category: "",
  subCategory: "",
  supplierLogo: "",
  productDetails: "",
  price: "",
  discount: "",
  stock: "",
  tag: "",
  tagColor: "#2970FF",
  image: "", // Keep for backward compatibility
  images: [] as ProductImage[], // New field for multiple images
  priceTiers: [] as PriceTier[], // Price tier configuration
};

const productCreationSlice = createSlice({
  name: "productCreation",
  initialState,
  reducers: {
    initializeProductData: (state, action: PayloadAction<Partial<ProductState>>) => {
      return { ...initialState, ...action.payload };
    },
    setName: (state, action) => {
      state.name = action.payload;
    },
    setSubName: (state, action) => {
      state.subName = action.payload;
    },
    setNotes: (state, action) => {
      state.notes = action.payload;
    },
    setCategory: (state, action) => {
      state.category = action.payload;
    },
    setSubCategory: (state, action) => {
      state.subCategory = action.payload;
    },
    setSupplierLogo: (state, action) => {
      state.supplierLogo = action.payload;
    },
    setProductDetails: (state, action) => {
      state.productDetails = action.payload;
    },
    setPrice: (state, action) => {
      state.price = action.payload;
    },
    setDiscount: (state, action) => {
      state.discount = action.payload;
    },
    setStock: (state, action) => {
      state.stock = action.payload;
    },
    setTag: (state, action) => {
      state.tag = action.payload;
    },
    setTagColor: (state, action) => {
      state.tagColor = action.payload;
    },
    setImage: (state, action) => {
      state.image = action.payload;
      
      // Also update the images array for new component
      if (action.payload) {
        // Check if this image already exists
        const existingImageIndex = state.images.findIndex(img => img.url === action.payload);
        
        if (existingImageIndex === -1) {
          // If not found, add as primary and make others non-primary
          state.images = state.images.map(img => ({
            ...img,
            isPrimary: false
          }));
          
          state.images.push({
            url: action.payload,
            isPrimary: true
          });
        } else {
          // If found, make it primary
          state.images = state.images.map((img, index) => ({
            ...img,
            isPrimary: index === existingImageIndex
          }));
        }
      }
    },
    // New actions for multiple images
    addImage: (state, action) => {
      const newImage = {
        url: action.payload.url,
        name: action.payload.name,
        size: action.payload.size,
        isPrimary: action.payload.isPrimary ?? false
      };
      
      // If this is the first image or marked as primary, update other images
      if (newImage.isPrimary) {
        state.images = state.images.map(img => ({
          ...img,
          isPrimary: false
        }));
        
        // Also update the single image field for backward compatibility
        state.image = newImage.url;
      }
      
      state.images.push(newImage);
    },
    removeImage: (state, action) => {
      const indexToRemove = action.payload;
      const wasRemovingPrimary = state.images[indexToRemove]?.isPrimary;
      
      state.images.splice(indexToRemove, 1);
      
      // If we removed the primary image, make the first one primary
      if (wasRemovingPrimary && state.images.length > 0) {
        state.images[0].isPrimary = true;
        state.image = state.images[0].url; // Update single image field
      } else if (state.images.length === 0) {
        state.image = ""; // Clear single image if no images left
      }
    },
    setPrimaryImage: (state, action) => {
      const primaryIndex = action.payload;
      
      state.images = state.images.map((img, index) => ({
        ...img,
        isPrimary: index === primaryIndex
      }));
      
      // Update single image field for backward compatibility
      if (state.images[primaryIndex]) {
        state.image = state.images[primaryIndex].url;
      }
    },
    setPriceTiers: (state, action: PayloadAction<PriceTier[]>) => {
      state.priceTiers = action.payload;
    },
    addPriceTier: (state, action: PayloadAction<PriceTier>) => {
      state.priceTiers.push(action.payload);
    },
    removePriceTier: (state, action: PayloadAction<string>) => {
      state.priceTiers = state.priceTiers.filter(tier => tier.id !== action.payload);
    },
    updatePriceTier: (state, action: PayloadAction<{ id: string; field: keyof PriceTier; value: string }>) => {
      const { id, field, value } = action.payload;
      const tier = state.priceTiers.find(t => t.id === id);
      if (tier) {
        (tier[field] as any) = value;
      }
    },
    removeAllItems: (state) => {
      state.name = "";
      state.subName = "";
      state.notes = "";
      state.category = "";
      state.subCategory = "";
      state.supplierLogo = "";
      state.productDetails = "";
      state.price = "";
      state.discount = "";
      state.stock = "";
      state.tag = "";
      state.tagColor = "";
      state.images = [];
      state.priceTiers = [];
    },
    resetProductCreation: () => initialState
  },
});

export const {
  initializeProductData,
  setName,
  setSubName,
  setNotes,
  setCategory,
  setSubCategory,
  setSupplierLogo,
  setProductDetails,
  setPrice,
  setDiscount,
  setStock,
  setTag,
  setTagColor,
  setImage,
  addImage,
  removeImage,
  setPrimaryImage,
  setPriceTiers,
  addPriceTier,
  removePriceTier,
  updatePriceTier,
  removeAllItems,
  resetProductCreation
} = productCreationSlice.actions;

export default productCreationSlice.reducer;
