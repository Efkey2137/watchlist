import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/app/globals.css";
import { AuthContextProvider } from "@/app/context/AuthContext";
import ProtectedRoute from "@/app/components/ProtectedRoute"; // <--- IMPORTUJ TUTAJ

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Watchlist",
  description: "App that allows users to create, manage, share watchlist and make a ranking of movies and series watched.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <AuthContextProvider>
          {/* Owiń całą aplikację w ProtectedRoute */}
          <ProtectedRoute>
             {children}
          </ProtectedRoute>
        </AuthContextProvider>
      </body>
    </html>
  );
}