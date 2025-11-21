"use client";
import { useState } from "react";
import { useUserAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useUserAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      router.push("/"); // Przekieruj na Dashboard po zalogowaniu
    } catch (err: any) {
      setError("Błąd logowania: " + err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1C1C1C] text-white">
      <div className="p-10 bg-[#2C2C2C] rounded-lg w-96">
        <h2 className="text-2xl mb-5 text-center">Zaloguj się</h2>
        {error && <p className="text-red-500 mb-3 text-sm">{error}</p>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            className="p-3 rounded bg-[#1C1C1C] text-white"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Hasło"
            className="p-3 rounded bg-[#1C1C1C] text-white"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" className="bg-[#A71F36] p-3 rounded hover:bg-[#D20000]">
            Wejdź
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-400">
          Nie masz konta? <Link href="/signup" className="text-white hover:underline">Zarejestruj się</Link>
        </p>
      </div>
    </div>
  );
}