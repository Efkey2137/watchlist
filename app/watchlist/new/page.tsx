"use client"
import Nav from "@/app/components/nav";
import Link from "next/link";
import addForm from "@/app/components/addForm";



export default function Home() {
    return (
        <main className="bg-[#1C1C1C] text-[#E9E9E9] min-h-screen p-4 md:p-24">
            <h1 className="text-3xl">Add new Anime/Series</h1>
            <Nav />
            <Link href="/watchlist">
                <div className="mt-5 w-fit bg-[#A71F36] hover:bg-[#D20000] text-white p-3 rounded-md text-xl hover:cursor-pointer">
                    Back to Watchlist
                </div>
            </Link>
            {addForm()}

        </main>
    );
}
