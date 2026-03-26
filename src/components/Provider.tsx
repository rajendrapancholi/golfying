'use client'
import React, { ReactNode } from "react";
import { ThemeProvider } from "./providers/ThemeProvider";
import ToastProvider from "./providers/ToastProvider";
const Provider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ToastProvider />
      {children}
    </ThemeProvider>
  );
};

export default Provider;
