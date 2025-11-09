import Nav from '../components/nav';

export default function Home() {
  return (
    <main className="bg-[#1C1C1C] text-[#E9E9E9] min-h-screen p-24">
      <h1 className="text-3xl">Rankings</h1>
        
        <Nav />

        <section className="mt-8">
          <p>Welcome to the Rankings page! Here you can view and manage your rankings.</p>
        </section>
    </main>
    );
}
