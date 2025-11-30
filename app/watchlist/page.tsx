"use client";
import Nav from "../components/nav";
import Cards from "../components/cards";
import FilterBar from "../components/FilterBar";
import Link from "next/link";
import { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import { collection, query, onSnapshot, doc, setDoc } from "firebase/firestore";
import { useUserAuth } from "../context/AuthContext";
import { Item } from "../types/cardItem";
import SortBar from "../components/SortBar";
import { sortItems, SortKey } from "../utils/sortItems";
import EditModal from "../components/EditModal";
import { AnimatePresence } from "framer-motion";

export default function Watchlist() {
    const { user, loading } = useUserAuth();
    const [items, setItems] = useState<Item[]>([]);
    
    // Stan filtrów
    const [filter, setFilter] = useState("All");
    
    // Stan sortowania (domyślny)
    const [activeSorts, setActiveSorts] = useState<SortKey[]>(["status", "score"]);

    // Stan edycji (modal)
    const [editingItem, setEditingItem] = useState<Item | null>(null);

    // 1. POBIERANIE ELEMENTÓW (ITEMS) Z BAZY
    useEffect(() => {
        if (!user) return;

        const q = query(collection(db, "users", user.uid, "items"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const itemsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Item[];
            setItems(itemsData);
        });

        return () => unsubscribe();
    }, [user]);

    // 2. POBIERANIE USTAWIEŃ SORTOWANIA Z BAZY
    useEffect(() => {
        if (!user) return;

        const userDocRef = doc(db, "users", user.uid);
        const unsubscribe = onSnapshot(userDocRef, (docSnapshot) => {
            if (docSnapshot.exists()) {
                const data = docSnapshot.data();
                // Sprawdzamy czy pole istnieje i czy jest tablicą
                if (data?.activeSorts && Array.isArray(data.activeSorts)) {
                    setActiveSorts(data.activeSorts);
                }
            }
        });

        return () => unsubscribe();
    }, [user]);

    // Funkcja zmiany sortowania (Zapis do Firebase)
    const toggleSort = async (key: SortKey) => {
        let newSorts: SortKey[] = [];
        
        if (activeSorts.includes(key)) {
            newSorts = activeSorts.filter((k) => k !== key);
        } else {
            newSorts = [...activeSorts, key];
        }

        // Optimistic UI (aktualizuj od razu)
        setActiveSorts(newSorts);

        // Zapisz w tle
        if (user) {
            try {
                await setDoc(
                    doc(db, "users", user.uid), 
                    { activeSorts: newSorts }, 
                    { merge: true }
                );
            } catch (e) {
                console.error("Błąd zapisu preferencji:", e);
            }
        }
    };

    // Funkcja otwierania modala
    const handleEdit = (item: Item) => {
        setEditingItem(item);
    };

    // LOGIKA PRZETWARZANIA DANYCH (Filtr -> Sort)
    const filteredItems = items.filter((item) => {
        if (filter === "All") return true;
        return item.type?.toLowerCase() === filter.toLowerCase();
    });

    const finalItems = sortItems(filteredItems, activeSorts);

    // UI DLA STANU LOADING / BRAK USERA
    if (loading) return <main className="bg-[#1C1C1C] min-h-screen p-24 text-white">Ładowanie...</main>;

    if (!user) {
        return (
            <main className="bg-[#1C1C1C] min-h-screen p-24 text-white">
                <h1 className="text-3xl mb-5">Musisz się zalogować</h1>
                <Nav />
            </main>
        );
    }

    return (
        <main className="bg-[#1C1C1C] text-[#E9E9E9] min-h-screen p-4 md:p-24">
            <h1 className="text-3xl">Watchlist</h1>
            <Nav />

            
            

            <div className="flex flex-col items-center sm:block">
                <div className="mt-5">
                    <FilterBar currentFilter={filter} onFilterChange={setFilter} />
                </div>

            <SortBar activeSorts={activeSorts} onToggleSort={toggleSort} />
                

                <Link href="/watchlist/new">
                    <div className="mt-5 w-fit bg-[#A71F36] hover:bg-[#D20000] text-white p-3 rounded-md text-xl hover:cursor-pointer mb-8">
                        Add New Item
                    </div>
                </Link>

                <Cards items={finalItems} onEdit={handleEdit} />

                <AnimatePresence>
                    {editingItem && (
                        <EditModal 
                            key="edit-modal"
                            item={editingItem} 
                            onClose={() => setEditingItem(null)} 
                        />
                    )}
                </AnimatePresence>
            </div>
            
        </main>
    );
}