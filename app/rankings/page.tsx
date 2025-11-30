"use client";
import { useEffect, useState } from "react";
import Nav from "../components/nav";
import FilterBar from "../components/FilterBar"; // Upewnij się, że importujesz FilterBar
import RankingCard from "../components/RankingCard"; // <--- Nasz nowy komponent
import { useUserAuth } from "../context/AuthContext";
import { db } from "../lib/firebase";
import { collection, query, onSnapshot } from "firebase/firestore";
import { Item } from "../types/cardItem";
import { sortItems } from "../utils/sortItems";

export default function Rankings() {
  const { user, loading } = useUserAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [filter, setFilter] = useState("Anime");

  // ... (Kod useEffect do pobierania danych bez zmian) ...
  useEffect(() => {
      if (!user) return;
      const q = query(collection(db, "users", user.uid, "items"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
          const itemsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Item[];
          setItems(itemsData);
      });
      return () => unsubscribe();
  }, [user]);


  if (loading) return <main className="bg-[#1C1C1C] min-h-screen p-24 text-white">Ładowanie...</main>;
  if (!user) return <main className="bg-[#1C1C1C] min-h-screen p-24 text-white">Zaloguj się</main>;

  // 1. Filtrowanie i Sortowanie (najpierw sortujemy, żeby ranking był poprawny)
  const filteredItems = items.filter((item) => {
    const matchesType = filter === "All" ? true : item.type?.toLowerCase() === filter.toLowerCase();
    return matchesType && (item.score || 0) > 0;
  });
  
  const sortedItems = sortItems(filteredItems, ["score", "name"]);

  // 2. LOGIKA GRUPOWANIA PO OCENIE
  // Tworzymy strukturę: { 10: [Item, Item], 9: [Item], ... }
  const groupedByScore = sortedItems.reduce((groups, item) => {
    const score = item.score || 0;
    if (!groups[score]) {
      groups[score] = [];
    }
    groups[score].push(item);
    return groups;
  }, {} as Record<number, Item[]>);

  // Pobieramy unikalne oceny i sortujemy je malejąco (10, 9.5, 9...)
  const distinctScores = Object.keys(groupedByScore)
    .map(Number)
    .sort((a, b) => b - a);

  // Zmienna pomocnicza do liczenia globalnego miejsca w rankingu
  let globalRankIndex = 0;

  return (
<main className="bg-[#1C1C1C] text-[#E9E9E9] min-h-screen p-4 md:p-24">
        <h1 className="text-3xl font-bold mb-4">Rankings</h1>
      <Nav />
      
      <div className="mt-6 mb-10">
        <FilterBar currentFilter={filter} onFilterChange={setFilter} />
      </div>

 <section className="flex flex-col gap-10 max-w-4xl mx-auto">
  {distinctScores.length > 0 ? (
    distinctScores.map((score) => {
      // Sprawdzamy, ile jest elementów w tej konkretnej ocenie
      const itemsInGroup = groupedByScore[score];
      const isSingleItem = itemsInGroup.length === 1;

      return (
        <div key={score} className="relative">
          {/* Nagłówek Grupy (Ocena) */}
          <div className="flex items-center gap-4 mb-4">
            <div className="h-px bg-gray-700 grow"></div>
            <span className="text-2xl font-bold text-amber-400 border border-amber-400/30 px-4 py-1 rounded-full bg-amber-400/10">
              {score}
            </span>
            <div className="h-px bg-gray-700 grow"></div>
          </div>

          {/* Dynamiczna siatka:
             - Jeśli isSingleItem (1 element): grid-cols-1 (zawsze 1 kolumna -> pełna szerokość)
             - W przeciwnym razie: grid-cols-1 na mobilce, md:grid-cols-2 na PC
          */}
          <div 
            className={`grid gap-4 ${
              isSingleItem ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"
            }`}
          >
            {itemsInGroup.map((item) => {
              const currentRank = globalRankIndex;
              globalRankIndex++; 
              
              return (
                <RankingCard 
                  key={item.id} 
                  item={item} 
                  index={currentRank} 
                />
              );
            })}
          </div>
        </div>
      );
    })
  ) : (
    <p className="text-gray-500 text-center mt-10">Brak ocenionych pozycji.</p>
  )}
</section>
    </main>
  );
}