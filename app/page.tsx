"use client";
import Nav from './components/nav';
// Fragment do wklejenia np. w app/page.tsx tymczasowo
import list from '@/app/data/list.json';
import { db } from '@/app/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useUserAuth } from '@/app/context/AuthContext';

// Wewnątrz komponentu:


// W JSX:
// <button onClick={migrateData} className="bg-blue-500 p-4">Wgraj JSON do bazy</button>

export default function Home() {
  const { user } = useUserAuth();

const migrateData = async () => {
    if (!user) return;
    const colRef = collection(db, 'users', user.uid, 'items');
    
    for (const item of list) {
        await addDoc(colRef, {
            ...item,
            userId: user.uid,
            createdAt: new Date()
        });
        console.log("Dodano:", item.name);
    }
    alert("Migracja zakończona!");
};
  return (
    <main className="bg-[#1C1C1C] text-[#E9E9E9] min-h-screen p-24">
      <h1 className="text-3xl">Dashboard</h1>
        
        <Nav />

        <section className="mt-8">
          <p>Welcome to your dashboard! Here you can manage your watchlists and rankings.</p>
          <button onClick={migrateData} className="bg-blue-500 p-4">Wgraj JSON do bazy</button>
        </section>
    </main>
    );
}
