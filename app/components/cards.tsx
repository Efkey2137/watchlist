import Card from "./card";
import "../globals.css"
import { Item } from "@/app/types/cardItem";

interface CardsProps {
    items: Item[];
    onEdit: (item: Item)  => void;
}

const Cards = ({ items, onEdit }: CardsProps) => {

    return (
        <div className="flex flex-row gap-5 flex-wrap mt-5 w-full ease">
            {items.map((item, index) => (
                <Card 
                    key={index}
                    item={item}
                    onClick={() => onEdit(item)}
                />
            ))}
        </div>
    );
}

export default Cards;
