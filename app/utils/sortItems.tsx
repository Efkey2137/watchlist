import { Item } from "@/app/types/cardItem";

// Definiujemy dostępne klucze sortowania
export type SortKey = "status" | "score" | "type" | "order" | "name";

// Mapa wag dla statusów (żeby sortowały się w konkretnej kolejności, a nie alfabetycznie)
const statusWeights: { [key: string]: number } = {
  watching: 1,
  completed: 2,
  planned: 3,
  dropped: 4,
};

export const sortItems = (items: Item[], activeSorts: SortKey[]) => {
  // Kopiujemy tablicę, żeby nie mutować oryginału
  return [...items].sort((a, b) => {
    
    // Iterujemy po aktywnych kryteriach (np. najpierw Status, potem Score)
    for (const key of activeSorts) {
      let valA = a[key];
      let valB = b[key];

      // 1. Obsługa STATUSU (wg naszej wagi)
      if (key === "status") {
        const weightA = statusWeights[valA as string] || 99;
        const weightB = statusWeights[valB as string] || 99;
        if (weightA !== weightB) {
          return weightA - weightB; // Rosnąco (Watching -> Dropped)
        }
      }
      
      // 2. Obsługa SCORE (Malejąco - wyższy wynik wyżej)
      else if (key === "score") {
        // Traktujemy brak oceny jako 0
        const scoreA = Number(valA) || 0;
        const scoreB = Number(valB) || 0;
        if (scoreA !== scoreB) {
          return scoreB - scoreA; // B - A (Malejąco)
        }
      }

      // 3. Obsługa ORDER (Rosnąco - 1, 2, 3...)
      else if (key === "order") {
        const orderA = Number(valA) || 0;
        const orderB = Number(valB) || 0;
        if (orderA !== orderB) {
            // Jeśli oba są 0 (brak orderu), to są równe.
            // Jeśli jeden ma order, a drugi nie (0), ten z orderem idzie wyżej.
            if (orderA === 0) return 1;
            if (orderB === 0) return -1;
            return orderA - orderB; // Rosnąco
        }
      }

      // 4. Domyślne sortowanie (alfabetyczne dla napisów)
      else {
        if (valA !== valB) {
            // Zabezpieczenie przed null/undefined
            const strA = String(valA || "").toLowerCase();
            const strB = String(valB || "").toLowerCase();
            if (strA < strB) return -1;
            if (strA > strB) return 1;
        }
      }
    }
    
    return 0; // Jeśli wszystkie kryteria są równe
  });
};