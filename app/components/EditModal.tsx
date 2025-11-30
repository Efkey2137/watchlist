"use client";
import { useState } from "react";
import { db } from "../lib/firebase";
import { 
  doc, 
  updateDoc, 
  deleteDoc, 
  writeBatch, 
  collection, 
  query, 
  where, 
  getDocs, 
  increment 
} from "firebase/firestore";
import { useUserAuth } from "../context/AuthContext";
import { Item } from "../types/cardItem";
import { useEffect } from "react";

interface EditModalProps {
  item: Item;
  onClose: () => void;
}

export default function EditModal({ item, onClose }: EditModalProps) {
  const { user } = useUserAuth();
  const [loading, setLoading] = useState(false);


    useEffect(() => {
        // Zablokuj scrollowanie strony głównej
        document.body.style.overflow = "hidden";
        
        // Odblokuj scrollowanie, gdy modal zniknie (cleanup function)
        return () => {
        document.body.style.overflow = "unset";
        };
    }, []);

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const newStatus = formData.get("status") as string;
    const oldStatus = item.status;
    const oldOrder = item.order || 0; // Pobieramy stary numer porządkowy

    // Dane do aktualizacji obecnego elementu
    const updatedData = {
      name: formData.get("name") as string,
      status: newStatus,
      type: formData.get("type") as string,
      score: Number(formData.get("score")) || 0,
      tier: formData.get("tier") as string,
      // Jeśli wychodzimy z 'planned', resetujemy order na 0, w przeciwnym razie bierzemy z formularza (lub zostawiamy stary)
      order: (oldStatus === "planned" && newStatus !== "planned") ? 0 : (item.order || 0), 
    };

    try {
      // SPRAWDZAMY WARUNEK: Czy element był "planned", zmienia status na inny I miał jakiś numer w kolejce?
      if (oldStatus === "planned" && newStatus !== "planned" && oldOrder > 0) {
        
        // 1. Inicjalizujemy Batch (paczkę operacji)
        const batch = writeBatch(db);

        // 2. Dodajemy do paczki aktualizację obecnego elementu (tego, który przenosimy)
        const currentItemRef = doc(db, "users", user.uid, "items", item.id);
        batch.update(currentItemRef, updatedData);

        // 3. Szukamy wszystkich elementów, które były ZA tym elementem w kolejce
        // (czyli mają status 'planned' i order większy niż stary order naszego elementu)
        const q = query(
            collection(db, "users", user.uid, "items"),
            where("status", "==", "planned"),
            where("order", ">", oldOrder)
        );

        const snapshot = await getDocs(q);

        // 4. Dla każdego znalezionego elementu, zmniejszamy jego order o 1
        snapshot.forEach((document) => {
            const docRef = doc(db, "users", user.uid, "items", document.id);
            // increment(-1) to bezpieczny sposób na odjęcie 1 po stronie bazy
            batch.update(docRef, { order: increment(-1) });
        });

        // 5. Wykonujemy wszystkie te operacje naraz
        await batch.commit();

      } else {
        // --- SCENARIUSZ STANDARDOWY (Brak zmian w kolejności) ---
        // Np. zmiana oceny, zmiana nazwy, albo zmiana z 'watching' na 'completed'
        const docRef = doc(db, "users", user.uid, "items", item.id);
        await updateDoc(docRef, updatedData);
      }

      onClose(); // Zamknij po sukcesie
    } catch (error) {
      console.error("Błąd aktualizacji:", error);
      alert("Nie udało się zaktualizować wpisu.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!user || !confirm("Czy na pewno chcesz usunąć ten element?")) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "items", item.id));
      onClose();
    } catch (error) {
        console.error(error);
    }
  };

  return (
    // Overlay (tło)
<div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center overflow-y-auto" onClick={onClose}>
      {/* Okno Modala (zatrzymujemy propagację kliknięcia, żeby nie zamknąć okna klikając w środek) */}
      <div className="bg-[#2C2C2C] p-8 rounded-xl w-full max-w-md relative border border-gray-700 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        
        <h2 className="text-2xl text-white mb-6 font-bold text-center">{item.name}</h2>
        
        <form onSubmit={handleUpdate} className="flex flex-col gap-4">
          
          <div>
            <label className="text-gray-400 text-sm">Tytuł</label>
            <input 
              name="name" 
              defaultValue={item.name}
              className="w-full p-3 rounded bg-[#1C1C1C] text-white border border-gray-600 focus:border-[#A71F36] outline-none"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
                <label className="text-gray-400 text-sm">Status</label>
                <select name="status" defaultValue={item.status} className="w-full p-3 rounded bg-[#1C1C1C] text-white border border-gray-600 outline-none h-12">
                    <option value="planned">Planned</option>
                    <option value="watching">Watching</option>
                    <option value="completed">Completed</option>
                    <option value="dropped">Dropped</option>
                </select>
            </div>
            <div className="flex-1">
                <label className="text-gray-400 text-sm">Typ</label>
                <select name="type" defaultValue={item.type} className="w-full p-3 rounded bg-[#1C1C1C] text-white border border-gray-600 outline-none h-12">
                    <option value="anime">Anime</option>
                    <option value="series">Series</option>
                    <option value="movie">Movie</option>
                </select>
            </div>
          </div>

          <div className="flex gap-4">
            {item.status !== "planned" && (
                <div className="flex-1">
                <label className="text-gray-400 text-sm">Ocena</label>
                <input name="score" type="number" step="0.1" defaultValue={item.score} className="w-full p-3 rounded bg-[#1C1C1C] text-white border border-gray-600 outline-none" />
             </div>
            )}
             

            {item.status === "completed" && (
                <div className="flex-1">
                <label className="text-gray-400 text-sm">Tier</label>
                <input name="tier" defaultValue={item.tier} className="w-full p-3 rounded bg-[#1C1C1C] text-white border border-gray-600 outline-none" />
             </div>
            )}
            {item.status !== "completed" && (
                <div className="flex-1">
                    <label className="text-gray-400 text-sm">Order</label>
                    <input name="order" defaultValue={item.order} className="w-full p-3 rounded bg-[#1C1C1C] text-white border border-gray-600 outline-none" />
                    </div>
            )}
             


          </div>

          <div className="flex gap-3 mt-4">
            <button type="submit" disabled={loading} className="flex-1 bg-[#A71F36] hover:bg-[#D20000] text-white p-3 rounded font-bold transition">
              {loading ? "Zapisywanie..." : "Zapisz"}
            </button>
            <button type="button" onClick={handleDelete} className="px-4 py-3 bg-red-900/50 hover:bg-red-900 text-red-200 rounded transition border border-red-800">
                Usuń
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}