// page.tsx (Home)
import Nav from "../components/nav";
import Cards from "../components/cards";
import list from "./list";



export default function Home() {
    return (
        <main className="bg-[#1C1C1C] text-[#E9E9E9] min-h-screen p-24 min-w-screen">
            <h1 className="text-3xl">Watchlist</h1>
            <Nav />
            <Cards items={list} />
        </main>
    );
}
