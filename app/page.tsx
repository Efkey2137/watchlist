import Link from "next/link";

const tabs = [
  { name: "Dashboard", href: "#", current: true },
  { name: "Watchlists", href: "#", current: false },
  {name: "Rankings", href: "#", current: false },
  { name: "Profile", href: "#", current: false },
];

export default function Home() {
  return (
    <main className="justify-center items-center flex flex-col bg-gray-700 min-h-screen p-24">
      <h1 className="text-3xl">Dashboard</h1>
        <nav className="flex rounded-md shadow-sm items-end" aria-label="Tabs">
          {tabs.map((tab) => (
            <Link key={tab.name} href={tab.href}>
              <div className="mt-6 mr-3 text-teal-700">
                {tab.name}
              </div>
            </Link>
          ))}

        </nav>
    </main>
    );
}
