"use client";
import Nav from './components/nav';
import { useUserAuth } from './context/AuthContext';
import { db } from './lib/firebase';
// Dodajemy potrzebne importy: updateDoc, doc, getDocs, query
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { useState } from 'react';

export default function Home() {
  const { user, logOut } = useUserAuth();
  const [updating, setUpdating] = useState(false);

  // Funkcja naprawcza - dodaje "type: anime" do wszystkich wpisów
  const fixData = async () => {
    if (!user) return;
    
    if (!confirm("Czy na pewno chcesz zaktualizować wszystkie wpisy, ustawiając im typ 'anime'?")) return;

    setUpdating(true);
    try {
      // 1. Pobieramy wszystkie dokumenty z kolekcji items użytkownika
      const querySnapshot = await getDocs(collection(db, "users", user.uid, "items"));
      
      let count = 0;
      // 2. Przechodzimy przez każdy dokument i go aktualizujemy
      const updates = querySnapshot.docs.map(async (document) => {
        const docRef = doc(db, "users", user.uid, "items", document.id);
        
        // updateDoc zmienia TYLKO podane pole, resztę zostawia bez zmian
        await updateDoc(docRef, {
          type: "anime" 
        });
        count++;
      });

      // Czekamy aż wszystkie się zaktualizują
      await Promise.all(updates);
      
      alert(`Sukces! Zaktualizowano ${count} wpisów. Każdy ma teraz typ 'anime'.`);
    } catch (e) {
      console.error(e);
      alert("Wystąpił błąd podczas aktualizacji.");
    } finally {
      setUpdating(false);
    }
  };

  return (
<main className="bg-[#1C1C1C] text-[#E9E9E9] min-h-screen p-4 md:p-24">
        <h1 className="text-3xl">Dashboard</h1>
      <Nav />

      <section className="mt-8 flex flex-col gap-4 items-start">
        <p>Witaj  {user ? `${user.displayName}!` : "Nie jesteś zalogowany."}</p>
        
        
      </section>
    </main>
  );
}