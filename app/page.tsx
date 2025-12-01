"use client";
import Nav from './components/nav';
import { useUserAuth } from './context/AuthContext';
import { db } from './lib/firebase';
import { collection, query, onSnapshot, where } from "firebase/firestore";
import { useState, useEffect } from 'react';
import { Item } from './types/cardItem';
// POPRAWKA 1: Importujemy 'Cards' z pliku z liczbą mnogą (kontener), a nie pojedynczą kartę
import Cards from './components/cards'; 
import { sortItems } from "./utils/sortItems";
import EditModal from './components/EditModal';

export default function Home() {
  const { user, loading } = useUserAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [displayLimit, setDisplayLimit] = useState(6); 
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  // Pobieranie danych z Firebase
  useEffect(() => {
      if (!user) return;

      // Opcjonalnie: Możesz pobrać tylko te ze statusem "planned", jeśli to ma być "Up Next"
      const q = query(collection(db, "users", user.uid, "items"), where("status", "in", ["planned", "watching"]));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
          const itemsData = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
          })) as Item[];
          setItems(itemsData);
      });

      return () => unsubscribe();
  }, [user]);

  // 2. Obsługa zmiany rozmiaru ekranu (Limit elementów)
  useEffect(() => {
    const handleResize = () => {
        // Jeśli ekran jest mniejszy niż 640px (mobilny), pokaż 2 elementy
        if (window.innerWidth < 640) {
            setDisplayLimit(2);
        } 
        // Jeśli tablet/mały laptop -> 4 elementy
        else if (window.innerWidth < 1024) {
            setDisplayLimit(4);
        }
        // Desktop -> 6 lub 7 elementów
        else {
            setDisplayLimit(7);
        }
    };

    // Ustawienie początkowe
    handleResize();

    // Nasłuchiwanie na zmianę rozmiaru okna
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleEdit = (item: Item) => {
      console.log("Edit item:", item.name);
      setEditingItem(item);
  };

  // 3. Logika przygotowania danych do wyświetlenia
  // a) Sortujemy po 'order' (rosnąco), potem po nazwie
  const sortedItems = sortItems(items, ["order", "name"]);
  
  // b) Wycinamy tylko tyle elementów, ile mieści się na ekranie (slice)
  // Warto dodać filtr, np. żeby pokazywać tu tylko rzeczy "planned" (do obejrzenia)
  const visibleItems = sortedItems
    .filter(item => item.type === 'anime') // Odkomentuj jeśli chcesz tylko planowane
    .slice(0, displayLimit);


  if (loading) {
    return <main className="bg-[#1C1C1C] min-h-screen p-24 text-white">Ładowanie...</main>;
  }

  if (!user) {
    return <main className="bg-[#1C1C1C] min-h-screen p-24 text-white">Zaloguj się</main>;
  }

  return (
    <main className="bg-[#1C1C1C] text-[#E9E9E9] min-h-screen p-4 md:p-24">
      <h1 className="text-3xl">Dashboard</h1>
      <Nav />

      <section className="mt-8 flex flex-col items-center md:items-start gap-4 w-full">
        <h2 className="text-xl text-center sm:text-left font-bold text-gray-400 uppercase">Up Next</h2>
        
        {/* Przekazujemy przefiltrowane i przycięte elementy */}
        {visibleItems.length > 0 ? (
            <Cards items={visibleItems} onEdit={handleEdit} />
        ) : (
            <p className="text-gray-500">Your list is empty.</p>
        )}

      </section>
    </main>
  );
}