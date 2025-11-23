"use client";
import Nav from "../components/nav";
import Cards from "../components/cards";
import Link from "next/link";
import { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { useUserAuth } from "../context/AuthContext";
import FilterBar from "../components/FilterBar";
import { Filter } from "firebase-admin/firestore";
import "@/types/cardItem";



export default function Watchlist() {
    const { user, loading } = useUserAuth();
    const [items, setItems] = useState<Item[]>([]);
    const [filter, setFilter] = useState<string>("All");

    useEffect(() => {
        if (!user) return;

        // Zapytanie do bazy: Daj elementy tego usera
        const q = query(collection(db, "users", user.uid, "items"));

        // onSnapshot to nasłuchwianie w czasie rzeczywistym!
        // Jak dodasz coś w innej karcie, tu pojawi się od razu.
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const itemsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Item[];
            setItems(itemsData);
        });

        return () => unsubscribe();
    }, [user]);

    if (loading) return <main className="bg-[#1C1C1C] min-h-screen p-24 text-white">Ładowanie...</main>;

    if (!user) {
        return (
            <main className="bg-[#1C1C1C] min-h-screen p-24 text-white">
                <h1 className="text-3xl mb-5">Musisz się zalogować</h1>
                <Nav />
            </main>
        );
    }

    const filteredItems = items.filter(item => {
        if(filter === "All") return true;
        else return item.type?.toLowerCase() === filter.toLowerCase();
    })


    return (
        <main className="bg-[#1C1C1C] text-[#E9E9E9] min-h-screen p-24 min-w-screen">
            <h1 className="text-3xl">Watchlist</h1>
            <Nav />
            <Link href="/watchlist/new">
                <div className="mt-5 w-fit bg-[#A71F36] hover:bg-[#D20000] text-white p-3 rounded-md text-xl hover:cursor-pointer">
                    Add New Item
                </div>
            </Link>

            {/*FilterBar */}
            <FilterBar currentFiler={filter} onFilterChange={setFilter}/>


            {/* Cards */}
            <Cards items={filteredItems} />
        </main>
    );
}