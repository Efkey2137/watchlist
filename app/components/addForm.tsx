"use client"
import { useState } from "react";

const AddForm = () => {
    const [status, setStatus] = useState("planned");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setStatus(e.target.value);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get('title') as string,
            status: formData.get('status') as string,
            score: formData.get('score') as string,
            tier: formData.get('tier') as string,
        };

        try {
            const response = await fetch('/api/add-anime', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                alert('Anime added successfully!');
                (e.target as HTMLFormElement).reset();
                setStatus('planned');
            } else {
                alert('Failed to add anime');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error adding anime');
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
                    name="status"
                    className="p-3 rounded-md bg-[#2C2C2C] text-white focus:outline-none h-16"
                    defaultValue="select"
                    onChange={handleStatusChange}
                    required
                >
                    <option value="select" disabled>Select Status</option>
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
                    {isSubmitting ? 'Adding...' : 'Add to Watchlist'}
                </button>
            </form>
        </div>
    );
}

export default AddForm;
