import Link from "next/link";

interface CardProps {
    name: string;
    status: string;
    score?: number;
    tier?: string;
    createdAt?: any;
    type?: string;
    order?: number;
}

const statusStyles: { [key: string]: string } = {
  watching: "border-blue-600 text-white",
  completed: "border-green-600 text-white",
  dropped: "border-red-600 text-white",
  planned: "border-gray-700 text-white",
};

const Card = ({ name, status, score, tier, order, createdAt, type }: CardProps) => {
  const normalizedStatus = status?.toLowerCase() || "";
  const cardStyle = statusStyles[normalizedStatus] || "bg-[#25262E] text-xl";
  
  return (
    <div className={`rounded-2xl w-54 h-54 hover:cursor-pointer hover:bg-[#2A2B32] transition-all hover:scale-110 shadow p-5 border-2 overflow-hidden flex flex-col ${cardStyle}`}>
      <div aria-label={name} className="flex flex-col h-full">
        <h2 className="text-xl mb-2 text-center font-bold line-clamp-2">{name}</h2>
        
        <div className="grow" />
        
        <div className="text-center">
          
          {normalizedStatus === "planned" && order && (
            <p className="text-lg">{order}</p>
          )}
          
          {normalizedStatus !== "planned" && (
            <p className="text-lg">{score === undefined || score === 0 ? "N/A" : score}</p>
          )}
          {normalizedStatus !== "planned" && tier && (
            <p className="text-lg truncate">{tier}</p>
          )}
          <p className="text-sm text-gray-400 mb-2">Type: {type || "N/A"}</p>
          <p className="text-sm text-gray-400 mb-2">
            Created At: {createdAt ? new Date(createdAt).toLocaleDateString('pl-PL') : "N/A"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Card;
