import { configureStore } from "@reduxjs/toolkit";
import productCreationReducer from "./ProductCreationSlice";
export const store = configureStore({
  reducer: {
    productCreation: productCreationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
