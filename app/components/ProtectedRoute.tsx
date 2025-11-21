// app/components/ProtectedRoute.tsx
"use client";
import { useUserAuth } from "../context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

// Lista ścieżek, na które można wejść BEZ logowania
const publicRoutes = ["/login", "/signup"];

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUserAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Jeśli ładowanie skończone, nie ma użytkownika i NIE jesteśmy na publicznej stronie
    if (!loading && !user && !publicRoutes.includes(pathname)) {
      router.push("/login");
    }
    
    // Opcjonalnie: Jeśli user jest zalogowany i wchodzi na login/signup, przekieruj go na dashboard
    if (!loading && user && publicRoutes.includes(pathname)) {
        router.push("/");
    }

  }, [user, loading, router, pathname]);

  // 1. Jeśli trwa ładowanie (sprawdzanie czy zalogowany) -> Pokaż loader
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1C1C1C] text-white">
        <p className="text-xl">Ładowanie aplikacji...</p>
      </div>
    );
  }

  // 2. Jeśli nie ma usera i próbujemy wejść na chronioną stronę -> Zwróć null (nic nie pokazuj przed przekierowaniem)
  if (!user && !publicRoutes.includes(pathname)) {
    return null;
  }

  // 3. W przeciwnym razie -> Pokaż treść strony
  return <>{children}</>;
}