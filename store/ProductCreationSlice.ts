import { createSlice } from "@reduxjs/toolkit";

interface ProductImage {
  url: string;
  isPrimary: boolean;
}

const initialState = {
  name: "",
  subName: "",
  category: "",
  subCategory: "",
  pharmacyLogo: "",
  productDetails: "",
  price: "",
  discount: "",
  stock: "",
  tags: [],
  image: "", // Keep for backward compatibility
  images: [] as ProductImage[], // New field for multiple images
};

const productCreationSlice = createSlice({
  name: "productCreation",
  initialState,
  reducers: {
    setName: (state, action) => {
      state.name = action.payload;
    },
    setSubName: (state, action) => {
      state.subName = action.payload;
    },
    setCategory: (state, action) => {
      state.category = action.payload;
    },
    setSubCategory: (state, action) => {
      state.subCategory = action.payload;
    },
    setPharmacyLogo: (state, action) => {
      state.pharmacyLogo = action.payload;
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
    setTags: (state, action) => {
      state.tags = action.payload;
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
    removeAllItems: (state) => {
      state.name = "";
      state.subName = "";
      state.category = "";
      state.subCategory = "";
      state.pharmacyLogo = "";
      state.productDetails = "";
      state.price = "";
      state.discount = "";
      state.stock = "";
      state.tags = [];
      state.images = [];
    }
  },
});

export const {
  setName,
  setSubName,
  setCategory,
  setSubCategory,
  setPharmacyLogo,
  setProductDetails,
  setPrice,
  setDiscount,
  setStock,
  setTags,
  setImage,
  addImage,
  removeImage,
  setPrimaryImage,
  removeAllItems
} = productCreationSlice.actions;

export default productCreationSlice.reducer;
