"use client";
import { useState, useEffect } from "react";
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

interface EditModalProps {
  item: Item;
  onClose: () => void;
}

export default function EditModal({ item, onClose }: EditModalProps) {
  const { user } = useUserAuth();
  const [loading, setLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(item.status);

  useEffect(() => {
    document.body.style.overflow = "hidden";
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
    const type = formData.get("type") as string;
    
    // Pobieramy wpisany order. Jeśli pole jest puste lub ukryte, null.
    const formOrderInput = formData.get("order");
    const newOrder = formOrderInput ? Number(formOrderInput) : 0;

    const oldStatus = item.status;
    const oldOrder = item.order || 0; 

    // Ustalanie finalnego orderu dla TEGO elementu
    let finalOrder = 0;
    if (newStatus === "planned") {
        // Jeśli jest w planned, bierzemy z formularza (lub stary, jeśli user nic nie zmienił)
        finalOrder = newOrder > 0 ? newOrder : oldOrder;
    }

    const updatedData = {
      name: formData.get("name") as string,
      status: newStatus,
      type: type,
      score: Number(formData.get("score")) || 0,
      tier: formData.get("tier") as string,
      order: finalOrder,
    };

    try {
      const batch = writeBatch(db);
      const currentItemRef = doc(db, "users", user.uid, "items", item.id);
      
      // --- SCENARIUSZ 1: Zmiana kolejności WEWNĄTRZ "Planned" ---
      // (Status się nie zmienia, ale numer order jest inny)
      if (oldStatus === "planned" && newStatus === "planned" && finalOrder !== oldOrder) {
        
        // Najpierw aktualizujemy nasz element
        batch.update(currentItemRef, updatedData);

        if (finalOrder < oldOrder) {
            // PRZYPADEK: Przenosimy W GÓRĘ (np. z 19 na 14)
            // Elementy od 14 do 18 (item.order >= 14 && item.order < 19) muszą dostać +1
            const q = query(
                collection(db, "users", user.uid, "items"),
                where("status", "==", "planned"),
                where("type", "==", item.type),
                where("order", ">=", finalOrder),
                where("order", "<", oldOrder)
            );
            const snapshot = await getDocs(q);
            snapshot.docs.forEach((docSnap) => {
                // Pomijamy samych siebie (na wszelki wypadek)
                if (docSnap.id !== item.id) {
                    batch.update(docSnap.ref, { order: increment(1) });
                }
            });

        } else {
            // PRZYPADEK: Przenosimy W DÓŁ (np. z 2 na 5)
            // Elementy od 3 do 5 (item.order > 2 && item.order <= 5) muszą dostać -1
            const q = query(
                collection(db, "users", user.uid, "items"),
                where("status", "==", "planned"),
                where("type", "==", item.type),
                where("order", ">", oldOrder),
                where("order", "<=", finalOrder)
            );
            const snapshot = await getDocs(q);
            snapshot.docs.forEach((docSnap) => {
                if (docSnap.id !== item.id) {
                    batch.update(docSnap.ref, { order: increment(-1) });
                }
            });
        }

        await batch.commit();

      } 
      // --- SCENARIUSZ 2: Wychodzimy z "Planned" (np. Watching/Completed) ---
      // (Trzeba przesunąć resztę w górę, żeby załatać dziurę)
      else if (oldStatus === "planned" && newStatus !== "planned" && oldOrder > 0) {
        
        batch.update(currentItemRef, updatedData);

        const q = query(
            collection(db, "users", user.uid, "items"),
            where("status", "==", "planned"),
            where("type", "==", item.type),
            where("order", ">", oldOrder)
        );

        const snapshot = await getDocs(q);
        snapshot.docs.forEach((docSnap) => {
            batch.update(docSnap.ref, { order: increment(-1) });
        });

        await batch.commit();

      } 
      // --- SCENARIUSZ 3: Standardowa aktualizacja (bez wpływu na kolejkę) ---
      else {
        await updateDoc(currentItemRef, updatedData);
      }

      onClose();
    } catch (error) {
      console.error("Błąd aktualizacji:", error);
      alert("Nie udało się zaktualizować. Sprawdź konsolę (F12) czy nie brakuje indeksów!");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!user || !confirm("Czy na pewno chcesz usunąć ten element?")) return;
    setLoading(true);
    
    const oldStatus = item.status;
    const oldOrder = item.order || 0;

    try {
      if (oldStatus === "planned" && oldOrder > 0) {
          const batch = writeBatch(db);
          const itemRef = doc(db, "users", user.uid, "items", item.id);
          batch.delete(itemRef);

          const q = query(
            collection(db, "users", user.uid, "items"),
            where("status", "==", "planned"),
            where("type", "==", item.type),
            where("order", ">", oldOrder)
          );
          const snapshot = await getDocs(q);
          
          snapshot.docs.forEach((docSnap) => {
             batch.update(docSnap.ref, { order: increment(-1) });
          });

          await batch.commit();
      } else {
          await deleteDoc(doc(db, "users", user.uid, "items", item.id));
      }
      
      onClose();
    } catch (error) {
        console.error(error);
        alert("Błąd usuwania.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center overflow-y-auto" onClick={onClose}>
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
                <select 
                    name="status" 
                    value={currentStatus} 
                    onChange={(e) => setCurrentStatus(e.target.value)} 
                    className="w-full p-3 rounded bg-[#1C1C1C] text-white border border-gray-600 outline-none h-12"
                >
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
            {currentStatus !== "planned" && (
                <div className="flex-1">
                    <label className="text-gray-400 text-sm">Ocena</label>
                    <input 
                        name="score" 
                        type="number" 
                        step="0.1" 
                        defaultValue={item.score} 
                        className="w-full p-3 rounded bg-[#1C1C1C] text-white border border-gray-600 outline-none" 
                    />
                </div>
            )}
             
            {currentStatus === "dropped" && (
                <div className="flex-1">
                    <label className="text-gray-400 text-sm">Reason (Tier)</label>
                    <input 
                        name="tier" 
                        defaultValue={item.tier} 
                        className="w-full p-3 rounded bg-[#1C1C1C] text-white border border-gray-600 outline-none" 
                    />
                </div>
            )}

            {currentStatus === "planned" && (
                <div className="flex-1">
                    <label className="text-gray-400 text-sm">Order</label>
                    <input 
                        name="order" 
                        type="number" 
                        defaultValue={item.order} 
                        className="w-full p-3 rounded bg-[#1C1C1C] text-white border border-gray-600 outline-none" 
                    />
                </div>
            )}
          </div>

          <div className="flex gap-3 mt-4">
            <button type="submit" disabled={loading} className="flex-1 bg-[#A71F36] hover:bg-[#D20000] text-white p-3 rounded font-bold transition">
              {loading ? "Zapisywanie..." : "Zapisz"}
            </button>
            <button type="button" disabled={loading} onClick={handleDelete} className="px-4 py-3 bg-red-900/50 hover:bg-red-900 text-red-200 rounded transition border border-red-800">
                Usuń
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}