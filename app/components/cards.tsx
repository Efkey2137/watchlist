import Card from "./card";
import "../globals.css"

interface Item {
    name: string;
    status: string;
    score?: number;
    tier?: string;
    type?: string;
    createdAt?: any;
    order?: number;
}

interface CardsProps {
    items: Item[];
}

const Cards = ({ items }: CardsProps) => {
    // Sortuj tablicę według statusu i odpowiednich kryteriów
    const sortedItems = [...items].sort((a, b) => {
        const statusA = a.status.toLowerCase();
        const statusB = b.status.toLowerCase();
        
        // Jeśli oba mają status "completed", sortuj po score (malejąco)
        if (statusA === "completed" && statusB === "completed") {
            const scoreA = a.score ?? 0;
            const scoreB = b.score ?? 0;
            return scoreB - scoreA; // Malejąco (najwyższy score pierwszy)
        }
        
        // Jeśli oba mają status "planned", sortuj po order (rosnąco)
        if (statusA === "planned" && statusB === "planned") {
            const orderA = a.order ?? 0;
            const orderB = b.order ?? 0;
            return orderA - orderB; // Rosnąco
        }
        
        // Jeśli statusy są różne, najpierw "completed", potem "planned"
        if (statusA === "completed" && statusB !== "completed") {
            return -1; // "completed" przed innymi
        }
        if (statusA !== "completed" && statusB === "completed") {
            return 1; // "completed" przed innymi
        }
        
        // Dla innych statusów, sortuj po order
        const orderA = a.order ?? 0;
        const orderB = b.order ?? 0;
        return orderA - orderB;
    });

    return (
        <div className="flex flex-row gap-5 flex-wrap mt-5 w-full ease">
            {sortedItems.map((item, index) => (
                <Card 
                    key={index}
                    name={item.name} 
                    status={item.status} 
                    score={item.score} 
                    tier={item.tier}
                    type={item.type}
                    createdAt={item.createdAt}
                    order={item.order}
                />
            ))}
        </div>
    );
}

export default Cards;
