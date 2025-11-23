"use client";
import { SortKey } from "../utils/sortItems";

interface SortBarProps {
  activeSorts: SortKey[];
  onToggleSort: (key: SortKey) => void;
}

const sortOptions: { label: string; key: SortKey }[] = [
  { label: "Status", key: "status" },
  { label: "Score", key: "score" },
  { label: "Order", key: "order" },
  { label: "Type", key: "type" },
  { label: "Name", key: "name" },
];

const SortBar = ({ activeSorts, onToggleSort }: SortBarProps) => {
  return (
    <div className="flex gap-2 mb-4 flex-wrap items-center mt-5">
      <span className="text-gray-400 mr-2 text-sm uppercase font-bold">Sort by:</span>
      {sortOptions.map((option) => {
        const isActive = activeSorts.includes(option.key);
        // Znajdź pozycję (priorytet) sortowania: 1, 2, 3...
        const priorityIndex = activeSorts.indexOf(option.key) + 1; 

        return (
          <button
            key={option.key}
            onClick={() => onToggleSort(option.key)}
            className={`px-3 py-1 rounded-full text-sm border transition-all flex items-center gap-2 ${
              isActive
                ? "bg-[#A71F36] border-[#A71F36] text-white"
                : "bg-transparent border-gray-600 text-gray-400 hover:border-gray-400"
            }`}
          >
            {option.label}
            {isActive && (
                <span className="bg-black/30 rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {priorityIndex}
                </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default SortBar;