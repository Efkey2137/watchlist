import Link from "next/link";

interface CardProps {
    name: string;
    status: string;
    episodes?: number;
    score?: number;
    tier?: string;
}
const statusStyles: { [key: string]: string } = {
  watching: "border-blue-600 text-white",
  completed: "border-green-600 text-white",
  dropped: "border-red-600 text-white",
  planned: "border-gray-700 text-white",
  // dodaj inne statusy według potrzeb
};

const Card = ({ name, status, episodes, score, tier }: CardProps) => {
  // Wersja case-insensitive:
  const normalizedStatus = status?.toLowerCase() || "";
  const cardStyle = statusStyles[normalizedStatus] || "bg-[#25262E] text-xl";
  
  return (
    <div className={`rounded-2xl w-3xs h-64 hover:cursor-pointer hover:bg-[#2A2B32] transition-all hover:scale-110 shadow p-5 border-2 ${cardStyle}`}>
      <div aria-label={name} className="">
        <h2 className="text-2xl mb-2 text-center font-bold">{name}</h2>
        <p>Status: {status}</p>
        {episodes && <p>Episodes: {episodes}</p>}

        {normalizedStatus === "watched" && (
          <p>Score: {score === undefined || score === 0 ? "N/A" : score}</p>
        )}
        {normalizedStatus === "watched" && tier && (
          <p>Tier: {tier}</p>
        )}
      </div>
    </div>
  );
};

export default Card;
