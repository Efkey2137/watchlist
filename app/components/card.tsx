import Link from "next/link";

interface CardProps {
    name: string;
    status: string;
    episodes?: number;
    score?: number;
    tier?: string;
}

const Card = ({ name, status, episodes, score, tier }: CardProps) => {
    return (
        <div aria-label={name} className="bg-[#25262E] rounded text-xl w-3xs h-64 shadow p-5 hover:cursor-pointer hover:bg-[#2A2B32] hover:transform hover:scale-105 transition-all duration-200">
            <h2 className="text-2xl mb-2 text-center">{name}</h2>
                <p>Status: {status}</p>
                {episodes && <p>Episodes: {episodes}</p>}
                
                {/* Wyświetl score tylko jeśli status to "completed" */}
                {status.toLowerCase() === "completed" && (
                    <p>Score: {score === undefined || score === 0 ? "N/A" : score}</p>
                )}
                
                {/* Wyświetl tier tylko jeśli status to "completed" */}
                {status.toLowerCase() === "completed" && tier && (
                    <p>Tier: {tier}</p>
                )}
        </div>
    );
}

export default Card;
