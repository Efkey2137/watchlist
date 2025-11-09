import Link from "next/link";
import Nav from "../components/nav";

const tabs = [
  { name: "Dashboard", href: "#", current: true },
  { name: "Watchlists", href: "#", current: false },
  {name: "Rankings", href: "#", current: false },
  { name: "Profile", href: "#", current: false },
];

export default function Home() {
  return (
    <main className="bg-[#1C1C1C] text-[#E9E9E9] min-h-screen p-24">
      <h1 className="text-3xl">Watchlist</h1>
        <Nav />
    </main>
    );
}
