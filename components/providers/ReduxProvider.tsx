"use client";

import { Provider } from "react-redux";
import { store } from "@/store/store";
import AuthProvider from "../auth/AuthProvider";

export default function ReduxProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Provider store={store}>
      <AuthProvider>{children}</AuthProvider>
    </Provider>
  );
} 