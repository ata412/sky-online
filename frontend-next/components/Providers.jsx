'use client';

import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { FontSizeProvider } from '@/context/FontSizeContext';

export default function Providers({ children }) {
  return (
    <ThemeProvider>
      <FontSizeProvider>
        <AuthProvider>
          <CartProvider>{children}</CartProvider>
        </AuthProvider>
      </FontSizeProvider>
    </ThemeProvider>
  );
}
