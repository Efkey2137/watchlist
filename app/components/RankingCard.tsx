import { Item } from "@/app/types/cardItem";

interface RankingCardProps {
    item: Item;
    index: number; // Dodajemy index, żeby wyświetlać np. miejsce w rankingu
}

const RankingCard = ({ item, index }: RankingCardProps) => {
  return (
    // Używamy flex-row, aby stworzyć układ poziomy (panel), 
    // lub zostaw flex-col, jeśli wolisz kafelki, ale np. węższe.
    <div className="flex flex-col sm:flex-row items-center bg-[#25262E] p-4 rounded-xl border border-gray-700 shadow-md hover:scale-[1.02] transition-transform gap-4 hover:cursor-pointer">
      
      {/* Sekcja numeru / Miejsca */}
      <div className="flex items-center justify-center w-12 h-12 bg-[#A71F36] rounded-full text-white font-bold text-xl shrink-0">
        {index + 1}
      </div>

      {/* Sekcja treści */}
      <div className="flex flex-col grow">
        <h2 className="text-xl font-bold text-white sm:line-clamp-1 text-center sm:text-left">{item.name}</h2>
        <div className="flex items-center justify-center sm:justify-start gap-3 text-sm text-gray-400 mt-1">
            <span>{item.type}</span>
            {item.status === "completed" && <span className="text-green-500">Completed</span>}
            {item.status === "watching" && <span className="text-blue-500">Watching</span>}
            {item.status === "dropped" && <span className="text-red-500">Dropped</span>}
        </div>
      </div>

      {/* Sekcja oceny - wyróżniona */}
      <div className="hidden sm:block sm:text-right w-full sm:w-auto">
        <p className="text-3xl font-bold text-amber-400">{item.score}</p>
        <p className="text-xs text-gray-500 uppercase">Score</p>
      </div>
    </div>
  );
};

export default RankingCard;