"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

interface AvailabilityToggleProps {
  userId: string;
  initialAvailability: boolean;
}

export default function AvailabilityToggle({ userId, initialAvailability }: AvailabilityToggleProps) {
  const [isAvailable, setIsAvailable] = useState(initialAvailability);
  const [loading, setLoading] = useState(false);

  const toggleAvailability = async () => {
    setLoading(true);
    const newStatus = !isAvailable;
    setIsAvailable(newStatus);

    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ availability: newStatus })
      .eq("id", userId);

    if (error) {
      alert("Erreur lors du changement de statut");
      setIsAvailable(!newStatus); // Revert on error
    }
    setLoading(false);
  };

  return (
    <button
      onClick={toggleAvailability}
      disabled={loading}
      className={`flex items-center justify-between w-full p-4 rounded-xl border transition-all ${
        isAvailable
          ? "bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
          : "bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
      }`}
    >
      <div className="flex items-center gap-3">
        {loading ? (
          <Loader2 className="animate-spin" size={20} />
        ) : isAvailable ? (
          <CheckCircle size={20} className="text-green-600" />
        ) : (
          <XCircle size={20} className="text-red-600" />
        )}
        <div className="text-left">
          <span className="font-semibold block text-sm">
            {isAvailable ? "Disponible" : "Indisponible"}
          </span>
          <span className="text-xs opacity-75 block">
            {isAvailable ? "Les clients peuvent vous contacter" : "Vous n'êtes pas visible pour les clients"}
          </span>
        </div>
      </div>
      
      <div className={`w-10 h-6 rounded-full relative transition-colors ${isAvailable ? "bg-green-500" : "bg-gray-300"}`}>
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${isAvailable ? "left-5" : "left-1"}`} />
      </div>
    </button>
  );
}