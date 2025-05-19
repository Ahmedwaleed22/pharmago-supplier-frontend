import { configureStore } from "@reduxjs/toolkit";
import productCreationReducer from "./ProductCreationSlice";
import authReducer from "./authSlice";

export const store = configureStore({
  reducer: {
    productCreation: productCreationReducer,
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
