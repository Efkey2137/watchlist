"use client";
import Nav from './components/nav';
import { useUserAuth } from './context/AuthContext';
import { db } from './lib/firebase';
import { collection, query, onSnapshot, doc, setDoc } from "firebase/firestore";
import { useState, useEffect } from 'react';
import {Item} from './types/cardItem';
import Cards from './components/card';
import { sortItems, SortKey } from "./utils/sortItems";


  interface CardsProps {
    items: Item[];
    onEdit: (item: Item)  => void;
}

export default function Home(CardProps: CardsProps) {
  const { user, loading } = useUserAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [activeSorts, setActiveSorts] = useState<SortKey[]>(["order", "name"]);
  const [editingItem, setEditingItem] = useState<Item | null>(null);

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


  const handleEdit = (item: Item) => {
        setEditingItem(item);
    };

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

      <section className="mt-8 flex flex-col gap-4 items-start">

        <Cards items={items} onEdit={handleEdit} />
        
        
      </section>
    </main>
  );
}