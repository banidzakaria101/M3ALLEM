export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-md">
        <h1 className="text-3xl font-bold text-primary-700 mb-3">🇲🇦 M3ALLEM</h1>
        <p className="text-gray-600 mb-6">
          Tailwind v4 is working! Gradient + rounded card + shadow = success.
        </p>
        <button className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-xl transition shadow-md">
          ✅ Test Button
        </button>
      </div>
    </div>
  );
}