"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Star, Send, Loader2 } from "lucide-react";

// ✅ Updated interface to match Supabase's array return for FK joins
interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  customer: { full_name: string }[] | null;
}

export default function ReviewsSection({ workerId, initialRating, initialCount }: { workerId: string; initialRating: number; initialCount: number }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchReviews(); }, [workerId]);

  const fetchReviews = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("reviews")
      .select("id, rating, comment, created_at, customer:customer_id(full_name)")
      .eq("worker_id", workerId)
      .order("created_at", { ascending: false });
    
    if (data) setReviews(data as Review[]);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);

    const supabase = createClient();
    const { error } = await supabase.from("reviews").insert({
      worker_id: workerId, customer_id: user.id, rating, comment,
    });

    if (!error) {
      setComment(""); setRating(5); fetchReviews();
    } else {
      alert("Erreur: " + error.message);
    }
    setSubmitting(false);
  };

  if (loading) return <div className="text-center py-8 text-gray-500">Chargement des avis...</div>;

  return (
    <div className="bg-white rounded-2xl shadow-sm border p-6">
      <h2 className="text-xl font-bold text-dark mb-4">Avis des clients ({reviews.length})</h2>

      {user ? (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-xl space-y-3">
          <h3 className="font-medium text-gray-700">Laisser un avis</h3>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button key={star} type="button" onClick={() => setRating(star)} className={`text-2xl transition ${star <= rating ? "text-amber-400" : "text-gray-300"}`}>
                <Star size={24} fill={star <= rating ? "currentColor" : "none"} />
              </button>
            ))}
          </div>
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Partagez votre expérience..." className="w-full p-3 border rounded-lg resize-none focus:ring-2 focus:ring-primary-500 outline-none" rows={3} required />
          <button type="submit" disabled={submitting || !comment.trim()} className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50 transition">
            {submitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />} Publier
          </button>
        </form>
      ) : (
        <div className="mb-6 p-4 bg-gray-50 rounded-xl text-center text-gray-500 text-sm">Connectez-vous pour laisser un avis.</div>
      )}

      <div className="space-y-4">
        {reviews.length > 0 ? reviews.map((review) => {
          // ✅ Safely extract name from Supabase array join
          const customerName = review.customer?.[0]?.full_name || "Client anonyme";
          return (
            <div key={review.id} className="border-b pb-4 last:border-0">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold text-sm">
                    {customerName.charAt(0)}
                  </div>
                  <span className="font-medium text-dark">{customerName}</span>
                </div>
                <div className="flex items-center gap-1 text-amber-500">
                  <Star size={14} fill="currentColor" />
                  <span className="text-sm font-semibold text-dark">{review.rating}</span>
                </div>
              </div>
              <p className="text-gray-600 text-sm ml-10">{review.comment}</p>
              <p className="text-gray-400 text-xs ml-10 mt-1">{new Date(review.created_at).toLocaleDateString("fr-FR")}</p>
            </div>
          );
        }) : (
          <p className="text-gray-400 text-center py-4">Aucun avis pour le moment. Soyez le premier !</p>
        )}
      </div>
    </div>
  );
}