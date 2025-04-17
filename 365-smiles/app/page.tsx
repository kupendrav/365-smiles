export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-center p-6">
      <h1 className="text-4xl font-bold mb-4">🎉 Welcome to 365 Smiles</h1>
      <p className="text-lg max-w-xl mb-6">
        Donate your birthday and help us feed orphans, the elderly, and differently-abled individuals—365 days a year.
      </p>
      <a
        href="/calendar"
        className="bg-blue-600 text-white px-6 py-3 rounded-full text-lg hover:bg-blue-700 transition"
      >
        Sponsor a Day
      </a>
    </main>
  );
}