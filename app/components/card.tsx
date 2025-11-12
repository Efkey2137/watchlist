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
        <div className="bg-[#25262E] rounded text-xl w-3xs shadow mt-2.5 mr-4">
            <div aria-label={name} className="p-5 hover:cursor-pointer hover:bg-[#2A2B32]">
                <h2 className="text-2xl mb-2 text-center">{name}</h2>
                <p>Status: {status}</p>
                {episodes && <p>Episodes: {episodes}</p>}
                {score && <p>Score: {score}</p>}
                {tier && <p>Tier: {tier}</p>}
            </div>
        </div>
    );
}

export default Card;
