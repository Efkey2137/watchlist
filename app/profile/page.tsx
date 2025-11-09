import Nav from '../components/nav';

export default function Home() {
  return (
    <main className="bg-[#1C1C1C] text-[#E9E9E9] min-h-screen p-24">
      <h1 className="text-3xl">Profile</h1>
        
        <Nav />

        <section className="mt-8">
          <p>Welcome to your profile! Here you can manage your personal information and settings.</p>
        </section>
    </main>
    );
}
