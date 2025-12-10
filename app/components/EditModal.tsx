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
  
  // NOWOŚĆ: Stan dla statusu, żeby dynamicznie pokazywać/ukrywać pola w modalu
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
    const formOrderInput = formData.get("order");
    const formOrder = formOrderInput ? Number(formOrderInput) : null;

    const oldStatus = item.status;
    const oldOrder = item.order || 0; 

    let finalOrder = 0;
    if (newStatus === "planned") {
        finalOrder = formOrder !== null ? formOrder : oldOrder;
    }

    const updatedData = {
      name: formData.get("name") as string,
      status: newStatus,
      type: formData.get("type") as string,
      score: Number(formData.get("score")) || 0,
      tier: formData.get("tier") as string,
      order: finalOrder,
    };

    try {
      // Jeśli wychodzi z planned i miał order > 0, przesuwamy resztę
      if (oldStatus === "planned" && newStatus !== "planned" && oldOrder > 0) {
        
        const batch = writeBatch(db);
        const currentItemRef = doc(db, "users", user.uid, "items", item.id);
        batch.update(currentItemRef, updatedData);

        const q = query(
            collection(db, "users", user.uid, "items"),
            where("status", "==", "planned"),
            where("type", "==", item.type),
            where("order", ">", oldOrder)
        );

        const snapshot = await getDocs(q);

        snapshot.docs.forEach((docSnap) => {
            const docRef = doc(db, "users", user.uid, "items", docSnap.id);
            batch.update(docRef, { order: increment(-1) });
        });

        await batch.commit();

      } else {
        const docRef = doc(db, "users", user.uid, "items", item.id);
        await updateDoc(docRef, updatedData);
      }

      onClose();
    } catch (error) {
      console.error("Błąd aktualizacji:", error);
      alert("Nie udało się zaktualizować wpisu.");
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
                    onChange={(e) => setCurrentStatus(e.target.value)} // Aktualizujemy stan przy zmianie
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
            {/* Score: Widoczne zawsze, OPRÓCZ Planned */}
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
             
            {/* Tier: Widoczny TYLKO dla Dropped */}
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

            {/* Order: Widoczny TYLKO dla Planned */}
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