import Link from "next/link";
import { Item } from "@/app/types/cardItem";

interface CardProps {
    item: Item;
    onClick?: () => void;
}

const statusStyles: { [key: string]: string } = {
  watching: "border-blue-600 text-white",
  completed: "border-green-600 text-white",
  dropped: "border-red-600 text-white",
  planned: "border-gray-700 text-white",
};

const Card = ({ item, onClick }: CardProps) => {

  const { name, status, score, tier, order, createdAt, type } = item;
  
  const normalizedStatus = status?.toLowerCase() || "";
  const cardStyle = statusStyles[normalizedStatus] || "bg-[#25262E] text-xl";
  
  // Funkcja pomocnicza do formatowania daty
  const formatDate = (date: any) => {
    if (!date) return "N/A";
    
    // Jeśli to Timestamp z Firebase (ma metodę toDate)
    if (date && typeof date.toDate === 'function') {
        return date.toDate().toLocaleDateString('pl-PL');
    }
    
    // Jeśli to zwykła data JS, string lub liczba
    return new Date(date).toLocaleDateString('pl-PL');
  };

  return (
    <div onClick={onClick} className={`rounded-2xl w-54 h-54 hover:cursor-pointer hover:bg-[#2A2B32] transition-all hover:scale-110 shadow p-5 border-2 overflow-hidden flex flex-col ${cardStyle}`}>
      <div aria-label={name} className="flex flex-col h-full">
        <h2 className="text-xl mb-2 text-center font-bold">{name}</h2>
        
        <div className="grow" />
        
        <div className="text-center">
          
          {normalizedStatus === "planned" && order && (
            <p className="text-lg">{order}</p>
          )}
          
          {normalizedStatus !== "planned" && (
            <p className="text-lg text-amber-200">{score === undefined || score === 0 ? "N/A" : score}</p>
          )}
          <p className="text-sm text-gray-400 mb-2">{type || "N/A"}</p>
          
          <p className="text-sm text-gray-400 mb-2">
            Created At: {formatDate(createdAt)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Card;