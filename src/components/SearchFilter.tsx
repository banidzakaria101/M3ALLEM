"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, MapPin, SlidersHorizontal } from "lucide-react";
import { useState } from "react";

const CITIES = [
  { value: "", label: "Toutes les villes" },
  { value: "casablanca", label: "Casablanca" },
  { value: "rabat", label: "Rabat" },
  { value: "marrakech", label: "Marrakech" },
  { value: "fes", label: "Fès" },
  { value: "tangier", label: "Tanger" },
  { value: "agadir", label: "Agadir" },
  { value: "beni-mellal", label: "Béni Mellal" },
];

export default function SearchFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  const currentSearch = searchParams.get("search") || "";
  const currentCity = searchParams.get("city") || "";

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const search = formData.get("search") as string;
    const city = formData.get("city") as string;

    // Build new URL params while preserving others
    const params = new URLSearchParams(searchParams.toString());
    search ? params.set("search", search) : params.delete("search");
    city ? params.set("city", city) : params.delete("city");

    // Push to URL without full reload
    router.push(`${pathname}?${params.toString()}`);
    
    // Simulate loading state (optional, router handles transition naturally)
    setTimeout(() => setLoading(false), 300);
  };

  return (
    <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-sm border p-4 md:p-6 w-full">
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            name="search"
            defaultValue={currentSearch}
            placeholder="Rechercher un artisan, service ou ville..."
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition"
          />
        </div>

        {/* City Dropdown */}
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <select
            name="city"
            defaultValue={currentCity}
            className="w-full md:w-48 pl-10 pr-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none appearance-none cursor-pointer"
          >
            {CITIES.map((city) => (
              <option key={city.value} value={city.value}>{city.label}</option>
            ))}
          </select>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="bg-primary-600 hover:bg-primary-700 disabled:opacity-70 text-white font-semibold px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition min-w-[120px]"
        >
          {loading ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <SlidersHorizontal size={18} /> Filtrer
            </>
          )}
        </button>
      </div>
    </form>
  );
}