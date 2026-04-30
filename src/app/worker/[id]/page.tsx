import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import { MapPin, Star, Phone, MessageCircle, CheckCircle, Clock, ShieldCheck } from "lucide-react";
import { formatPhone, getWhatsAppLink, getCallLink } from "@/lib/utils";
import ReviewsSection from "@/components/ReviewsSection";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: worker } = await supabase
    .from("profiles")
    .select("full_name, cities(name_fr)")
    .eq("id", id)
    .single();

  if (!worker) return { title: "Artisan non trouvé | M3ALLEM" };
  
  return {
    title: `${worker.full_name} | M3ALLEM`,
    description: `Contactez ${worker.full_name}, artisan vérifié à ${worker.cities?.name_fr || "Maroc"}. Plomberie, électricité, peinture et plus.`,
    openGraph: {
      title: `${worker.full_name} | M3ALLEM`,
      description: `Artisan vérifié au Maroc. Contactez directement via WhatsApp ou appel.`,
    },
  };
}

export default async function WorkerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const {  worker, error } = await supabase
    .from("profiles")
    .select(`
      id, full_name, phone, is_verified, availability,
      worker_details!inner(bio, years_experience, profile_image_url, rating_avg, reviews_count),
      cities(name_fr),
      worker_categories(category_id, categories(name_fr))
    `)
    .eq("id", id)
    .single();

  if (error || !worker) return notFound();

  const categories = worker.worker_categories
    ?.map((wc: any) => wc.categories?.name_fr as string)
    .filter(Boolean) || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Card */}
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="md:flex">
          {/* Image */}
          <div className="md:w-1/3 bg-gray-100 relative h-64 md:h-auto">
            {worker.worker_details?.profile_image_url ? (
              <Image
                src={worker.worker_details.profile_image_url}
                alt={worker.full_name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-6xl font-bold opacity-30">
                {worker.full_name.charAt(0)}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="md:w-2/3 p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-dark flex items-center gap-2">
                  {worker.full_name}
                  {worker.is_verified && <ShieldCheck className="text-primary-600" size={24} />}
                </h1>
                <div className="flex items-center gap-2 text-gray-500 mt-2">
                  <MapPin size={16} />
                  <span>{worker.cities?.name_fr || "Maroc"}</span>
                  <span>•</span>
                  <Clock size={16} />
                  <span>{worker.worker_details?.years_experience || 0} ans d'expérience</span>
                </div>
              </div>
              {worker.availability ? (
                <span className="px-3 py-1 bg-accent-50 text-accent-600 text-sm font-medium rounded-full flex items-center gap-1">
                  <span className="w-2 h-2 bg-accent-500 rounded-full animate-pulse"></span> Disponible
                </span>
              ) : (
                <span className="px-3 py-1 bg-gray-100 text-gray-500 text-sm font-medium rounded-full">Indisponible</span>
              )}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-amber-500">
                <Star size={18} fill="currentColor" />
                <span className="font-bold text-dark">{worker.worker_details?.rating_avg?.toFixed(1) || "0.0"}</span>
              </div>
              <span className="text-gray-400 text-sm">({worker.worker_details?.reviews_count || 0} avis)</span>
            </div>

            {/* Services */}
            <div className="flex flex-wrap gap-2 pt-2">
              {categories.map((cat, i) => (
                <span key={i} className="px-3 py-1 bg-primary-50 text-primary-700 text-sm font-medium rounded-full">
                  {cat}
                </span>
              ))}
            </div>

            {/* Bio */}
            {worker.worker_details?.bio && (
              <p className="text-gray-600 leading-relaxed pt-2">{worker.worker_details.bio}</p>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <a
                href={getWhatsAppLink(worker.phone)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-accent-500 hover:bg-accent-600 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition"
              >
                <MessageCircle size={18} /> WhatsApp
              </a>
              <a
                href={getCallLink(worker.phone)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-dark font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition"
              >
                <Phone size={18} /> Appeler
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section (Client Component) */}
      <ReviewsSection workerId={worker.id} initialRating={worker.worker_details?.rating_avg || 0} initialCount={worker.worker_details?.reviews_count || 0} />
    </div>
  );
}