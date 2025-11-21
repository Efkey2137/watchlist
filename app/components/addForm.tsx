"use client"
import { useState } from "react";
import { db } from "../lib/firebase"; 
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
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
        // 1. POBIERAMY TYP Z FORMULARZA
        const type = formData.get('type') as string; 

        try {
            // Sprawdzanie duplikatów po tytule (tak jak prosiłeś wcześniej)
            const checkQuery = query(
                collection(db, "users", user.uid, "items"),
                where("name", "==", title)
            );

            const querySnapshot = await getDocs(checkQuery);

            if (!querySnapshot.empty) {
                alert(`Tytuł "${title}" znajduje się już na Twojej liście!`);
                setIsSubmitting(false);
                return;
            }

            // 2. DODAJEMY TYP DO OBIEKTU, KTÓRY LECI DO BAZY
            const newItem = {
                name: title,
                type: type, // <-- Tutaj zapisujemy czy to anime/series/movie
                status: formData.get('status') as string,
                score: Number(formData.get('score')) || 0,
                tier: formData.get('tier') as string || "",
                order: 0, 
                userId: user.uid, 
                createdAt: new Date()
            };

            await addDoc(collection(db, "users", user.uid, "items"), newItem);

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

                {/* NOWE POLE WYBORU TYPU */}
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

                {status !== "planned" && (
                    <>
                        <input
                            type="number"
                            name="score"
                            placeholder="Score"
                            step="0.1"
                            min="0"
                            max="11"
                            className="p-3 rounded-md bg-[#2C2C2C] text-white focus:outline-none h-16 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <input
                            type="text"
                            name="tier"
                            placeholder="Tier"
                            className="p-3 rounded-md bg-[#2C2C2C] text-white focus:outline-none h-16"
                        />
                    </>
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