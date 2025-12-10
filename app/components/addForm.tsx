"use client";
import { useState } from "react";
import { db } from "../lib/firebase"; 
import { collection, addDoc, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { useUserAuth } from "../context/AuthContext"; 

const AddForm = () => {
    const { user } = useUserAuth();
    const [status, setStatus] = useState("planned");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setStatus(e.target.value);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        if (!user) {
            alert("Musisz być zalogowany!");
            return;
        }

        setIsSubmitting(true);
        const formData = new FormData(e.currentTarget);
        const title = formData.get('title') as string;
        const type = formData.get('type') as string;
        const chosenStatus = formData.get('status') as string;

        try {
            const itemsRef = collection(db, "users", user.uid, "items");

            // 1. Sprawdzanie duplikatów
            const checkQuery = query(itemsRef, where("name", "==", title));
            const querySnapshot = await getDocs(checkQuery);

            if (!querySnapshot.empty) {
                alert(`Tytuł "${title}" znajduje się już na Twojej liście!`);
                setIsSubmitting(false);
                return;
            }

            // 2. Automatyczne obliczanie kolejności (Order)
            let newOrder = 0;
            
            if (chosenStatus === "planned") {
                const orderQuery = query(
                    itemsRef, 
                    where("status", "==", "planned"), 
                    where("type", "==", type),
                    orderBy("order", "desc"), 
                    limit(1)
                );
                
                const orderSnapshot = await getDocs(orderQuery);
                
                if (!orderSnapshot.empty) {
                    const lastItem = orderSnapshot.docs[0].data();
                    const lastOrder = lastItem.order || 0;
                    newOrder = lastOrder + 1;
                } else {
                    newOrder = 1; 
                }
            }

            const newItem = {
                name: title,
                type: type,
                status: chosenStatus,
                score: Number(formData.get('score')) || 0,
                tier: formData.get('tier') as string || "", // Zapisuje się tylko dla dropped
                order: newOrder, 
                userId: user.uid, 
                createdAt: new Date()
            };

            await addDoc(itemsRef, newItem);

            alert('Dodano pomyślnie!');
            (e.target as HTMLFormElement).reset();
            setStatus('planned');

        } catch (error) {
            console.error('Error:', error);
            alert('Błąd podczas dodawania');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="mt-10">
            <form className="flex flex-col gap-5 w-xl" onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="title"
                    placeholder="Title"
                    className="p-3 rounded-md bg-[#2C2C2C] text-white focus:outline-none h-16"
                    required
                />

                <select
                    name="type"
                    className="p-3 rounded-md bg-[#2C2C2C] text-white focus:outline-none h-16"
                    defaultValue="anime"
                    required
                >
                    <option value="anime">Anime</option>
                    <option value="series">Series</option>
                    <option value="movie">Movie</option>
                </select>

                <select
                    name="status"
                    className="p-3 rounded-md bg-[#2C2C2C] text-white focus:outline-none h-16"
                    value={status}
                    onChange={handleStatusChange}
                    required
                >
                    <option value="planned">Planned</option>
                    <option value="watching">Watching</option>
                    <option value="completed">Completed</option>
                    <option value="dropped">Dropped</option>
                </select>

                {/* Ocena: Widoczna dla wszystkiego OPRÓCZ Planned */}
                {status !== "planned" && (
                    <input
                        type="number"
                        name="score"
                        placeholder="Score"
                        step="0.1"
                        min="0"
                        max="11"
                        className="p-3 rounded-md bg-[#2C2C2C] text-white focus:outline-none h-16 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                )}

                {/* Tier (Powód): Widoczny TYLKO dla Dropped */}
                {status === "dropped" && (
                    <input
                        type="text"
                        name="tier"
                        placeholder="Reason (Tier)"
                        className="p-3 rounded-md bg-[#2C2C2C] text-white focus:outline-none h-16"
                    />
                )}

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-fit bg-[#A71F36] hover:bg-[#D20000] text-white p-3 rounded-md text-xl disabled:opacity-50"
                >
                    {isSubmitting ? 'Sprawdzanie...' : 'Add to Watchlist'}
                </button>
            </form>
        </div>
    );
}

export default AddForm;