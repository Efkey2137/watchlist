import Link from "next/link";

const tabs = [
  { name: "Dashboard", href: "/", current: true },
  { name: "Watchlists", href: "/watchlist", current: false },
  {name: "Rankings", href: "/rankings", current: false },
  { name: "Profile", href: "/profile", current: false },
];

const Nav = () => {
    return (
        <nav className="flex flex-wrap gap-2 rounded-md text-xl mt-3 w-full md:w-fit" aria-label="Tabs">
          {tabs.map((tab) => (
            <Link key={tab.name} href={tab.href}>
              <div className="text-[#A71F36] hover:text-[#D20000] hover:bg-[#25262E] p-3 md:p-5 rounded-md text-sm md:text-xl transition-colors">
                {tab.name}
              </div>
            </Link>
          ))}
        </nav>
    );
}

export default Nav;
