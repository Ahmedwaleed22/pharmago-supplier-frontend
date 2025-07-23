import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  user: Auth.User | null;
  pharmacy: Auth.Pharmacy | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  pharmacy: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth: (state, action: PayloadAction<{ user: Auth.User; pharmacy: Auth.Pharmacy; token: string }>) => {
      state.user = action.payload.user;
      state.pharmacy = action.payload.pharmacy;
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
      state.pharmacy = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    },
  },
});

export const getCurrency = (state: { auth: AuthState }) => {
  return state.auth.pharmacy?.country?.currency || null;
};

export const getPharmacy = (state: { auth: AuthState }) => {
  return state.auth.pharmacy;
};

export const getUser = (state: { auth: AuthState }) => {
  return state.auth.user;
};

export const { setAuth, setLoading, setError, logout } = authSlice.actions;
export default authSlice.reducer; 