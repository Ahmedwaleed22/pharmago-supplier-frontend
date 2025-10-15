import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  user: Auth.User | null;
  supplier: Auth.Supplier | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  supplier: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth: (state, action: PayloadAction<{ user: Auth.User; supplier: Auth.Supplier; token: string }>) => {
      state.user = action.payload.user;
      state.supplier = action.payload.supplier;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    logout: (state) => {
      state.user = null;
      state.supplier = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    },
  },
});

export const getCurrency = (state: { auth: AuthState }) => {
  return state.auth.supplier?.country?.currency || null;
};

export const getSupplier = (state: { auth: AuthState }) => {
  return state.auth.supplier;
};

export const getUser = (state: { auth: AuthState }) => {
  return state.auth.user;
};

export const getCurrencySymbol = (state: { auth: AuthState }) => {
  return state.auth.supplier?.country?.currency?.symbol || "$";
};

export const { setAuth, setLoading, setError, logout } = authSlice.actions;
export default authSlice.reducer; 