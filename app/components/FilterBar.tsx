import { on } from "events";

interface FilterProps{
    currentFilter: String,
    onFilterChange: Function,
}

const listOfFilters = ["All", "Anime", "Movies", "Series"];



const FilterBar = ({currentFilter, onFilterChange} : FilterProps) => {
    return (
        <div className="flex gap-4 mt-6">
            {listOfFilters.map((filter) => (
                <button 
                    key={filter}
                    className={`p-2 bg-red-500 rounded hover:cursor-pointer ${currentFilter === filter ? 'bg-red-800' : ''}`}
                    onClick={() => onFilterChange(filter)}
                >
                    {filter}
                </button>
            ))}
        </div>
    );
}

export default FilterBar;