import Card from "./card";
import "../globals.css"

interface Item {
    name: string;
    status: string;
    episodes?: number;
    score?: number;
    tier?: string;
}

interface CardsProps {
    items: Item[];
}

const Cards = ({ items }: CardsProps) => {
    return (
<       div className="flex flex-row gap-4">
                {items.map((item, index) => (
                <Card 
                    key={index}
                    name={item.name} 
                    status={item.status} 
                    episodes={item.episodes} 
                    score={item.score} 
                    tier={item.tier}
                />
            ))}
        </div>
    
    );
}

export default Cards;
