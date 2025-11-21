"use client";
import { useState, useEffect } from 'react';
import Nav from '../components/nav';
import { useUserAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { updateProfile } from 'firebase/auth'; // Import funkcji do zmiany nazwy

export default function ProfilePage() {
  const { user, logOut } = useUserAuth();
  const router = useRouter();

  // Stany do edycji nazwy
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState("");
  const [loadingUpdate, setLoadingUpdate] = useState(false);

  // Ustawienie początkowej nazwy po załadowaniu usera
  useEffect(() => {
    if (user?.displayName) {
      setNewName(user.displayName);
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await logOut();
      router.push('/login');
    } catch (error) {
      console.error("Błąd wylogowania:", error);
    }
  };

  const handleSaveName = async () => {
    if (!user) return;
    setLoadingUpdate(true);
    try {
      // Funkcja Firebase do aktualizacji profilu
      await updateProfile(user, {
        displayName: newName
      });
      setIsEditing(false);
      // Opcjonalnie: przeładowanie strony, aby odświeżyć dane w kontekście, 
      // choć Firebase często robi to automatycznie, reload daje pewność.
      window.location.reload(); 
    } catch (error) {
      console.error("Błąd zmiany nazwy:", error);
      alert("Nie udało się zmienić nazwy.");
    } finally {
      setLoadingUpdate(false);
    }
  };

  // Pobieramy pierwszą literę do awatara (z nazwy lub maila)
  const displayName = user?.displayName || user?.email?.split('@')[0] || "Użytkownik";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <main className="bg-[#1C1C1C] text-[#E9E9E9] min-h-screen p-24">
      <h1 className="text-3xl font-bold mb-6">Twój Profil</h1>
        
      <Nav />

      <section className="mt-10 flex flex-col gap-8 max-w-2xl">
        
        {/* Karta Użytkownika */}
        <div className="bg-[#25262E] p-8 rounded-2xl border-2 border-gray-700 shadow-lg flex flex-col md:flex-row items-center gap-8">
            
            {/* Awatar */}
            <div className="w-24 h-24 rounded-full bg-[#A71F36] flex items-center justify-center text-4xl font-bold text-white shadow-md border-4 border-[#1C1C1C] shrink-0">
                {initial}
            </div>

            {/* Informacje i Edycja */}
            <div className="flex-1 text-center md:text-left space-y-2 w-full">
                
                {isEditing ? (
                  // TRYB EDYCJI
                  <div className="flex flex-col gap-3">
                    <label className="text-xs text-gray-400 uppercase font-bold">Wpisz nową nazwę</label>
                    <input 
                      type="text" 
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="bg-[#1C1C1C] border border-gray-600 rounded p-2 text-white focus:border-[#A71F36] outline-none"
                      placeholder="Twoja nazwa"
                    />
                    <div className="flex gap-3 mt-1 justify-center md:justify-start">
                      <button 
                        onClick={handleSaveName}
                        disabled={loadingUpdate}
                        className="bg-green-700 hover:bg-green-600 text-white text-sm px-4 py-2 rounded transition"
                      >
                        {loadingUpdate ? "Zapisywanie..." : "Zapisz"}
                      </button>
                      <button 
                        onClick={() => { setIsEditing(false); setNewName(user?.displayName || ""); }}
                        className="bg-gray-600 hover:bg-gray-500 text-white text-sm px-4 py-2 rounded transition"
                      >
                        Anuluj
                      </button>
                    </div>
                  </div>
                ) : (
                  // TRYB PODGLĄDU
                  <>
                    <div className="flex items-center justify-center md:justify-start gap-3 group">
                      <h2 className="text-2xl font-bold text-white">
                          {displayName}
                      </h2>
                      {/* Ikonka ołówka (pojawia się po najechaniu) */}
                      <button 
                        onClick={() => setIsEditing(true)}
                        className="text-gray-500 hover:text-white transition p-1 rounded hover:bg-gray-700"
                        title="Zmień nazwę"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                        </svg>
                      </button>
                    </div>
                    <p className="text-gray-400 text-lg">
                        {user?.email}
                    </p>
                  </>
                )}

            </div>
        </div>


        <div className="bg-[#2C2C2C] p-5 rounded-xl border border-gray-800">
            <p className="text-xs text-gray-500 uppercase font-bold mb-1">Joined</p>
            <p className="font-mono text-sm text-gray-300">
                {user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString('pl-PL') : "Nieznana"}
            </p>
        </div>

        {/* Sekcja Akcji */}
        <div className="mt-4 border-t border-gray-800 pt-8">
            <button 
                onClick={handleLogout}
                className="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
            >
                <span>Log out</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                </svg>
            </button>
        </div>

      </section>
    </main>
  );
}