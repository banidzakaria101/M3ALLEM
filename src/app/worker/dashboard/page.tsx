import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Star, MapPin, Phone, Edit3, ShieldCheck, Calendar, TrendingUp, MessageSquare } from "lucide-react";
import AvailabilityToggle from "@/components/worker/AvailabilityToggle";

export default async function WorkerDashboard() {
  const supabase = await createClient();
  
  // ✅ FIXED: Correct destructuring with colon syntax
  const { data: authData } = await supabase.auth.getUser();
  const user = authData?.user;
  
  if (!user) redirect("/auth/login");

  // Fetch profile & details
  const { data: profileData } = await supabase
    .from("profiles")
    .select(`
      id, full_name, phone, availability, is_verified,
      worker_details(bio, years_experience, rating_avg, reviews_count, is_featured, subscription_tier, profile_image_url),
      cities(name_fr)
    `)
    .eq("id", user.id)
    .single();

  if (!profileData) return <div className="p-8 text-center text-gray-500">Profil introuvable</div>;

  // ✅ Safe extraction: Supabase returns joins as arrays
  const details = (profileData.worker_details as any[])?.[0] || {};
  const city = (profileData.cities as any[])?.[0]?.name_fr || "Maroc";

  const rating = details?.rating_avg || 0;
  const reviews = details?.reviews_count || 0;
  const experience = details?.years_experience || 0;
  const tier = details?.subscription_tier || "free";

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark">Tableau de bord</h1>
          <p className="text-gray-500">Gérez votre profil et votre disponibilité</p>
        </div>
        <Link
          href="/worker/onboarding"
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl font-medium transition"
        >
          <Edit3 size={16} /> Modifier le profil
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border p-6 text-center">
            <div className="relative w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-md">
              {details?.profile_image_url ? (
                <Image src={details.profile_image_url} alt="Profile" fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl font-bold">
                  {profileData.full_name?.charAt(0) || "U"}
                </div>
              )}
              {profileData.is_verified && (
                <div className="absolute bottom-0 right-0 bg-blue-500 text-white p-1 rounded-full border-2 border-white">
                  <ShieldCheck size={14} />
                </div>
              )}
            </div>
            
            <h2 className="text-xl font-bold text-dark">{profileData.full_name || "Artisan"}</h2>
            <div className="flex items-center justify-center gap-1 text-gray-500 text-sm mt-1 mb-4">
              <MapPin size={14} />
              <span>{city}</span>
            </div>

            <div className="flex items-center justify-center gap-1 text-sm mb-6">
              <span className="font-bold text-amber-500 flex items-center gap-1">
                <Star size={16} fill="currentColor" /> {rating.toFixed(1)}
              </span>
              <span className="text-gray-400">({reviews} avis)</span>
            </div>

            <AvailabilityToggle userId={profileData.id} initialAvailability={profileData.availability || false} />

            <div className="mt-6 pt-6 border-t text-left space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Phone size={16} /> {profileData.phone || "Non renseigné"}
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Calendar size={16} /> {experience} ans d'expérience
              </div>
              <div className="flex items-center gap-3 text-sm">
                <TrendingUp size={16} /> 
                <span className={`font-medium uppercase tracking-wide ${tier === 'pro' ? 'text-primary-600' : 'text-gray-500'}`}>
                  Plan {tier}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Stats & Bio */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-dark">{reviews}</span>
              <span className="text-sm text-gray-500 flex items-center gap-1"><MessageSquare size={14} /> Avis reçus</span>
            </div>
            <div className="bg-white p-5 rounded-xl border flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-amber-500">{rating.toFixed(1)}</span>
              <span className="text-sm text-gray-500 flex items-center gap-1"><Star size={14} /> Note moyenne</span>
            </div>
            <div className="bg-white p-5 rounded-xl border flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-primary-600">{experience}</span>
              <span className="text-sm text-gray-500 flex items-center gap-1"><Calendar size={14} /> Années exp.</span>
            </div>
          </div>

          {/* Bio Preview */}
          <div className="bg-white rounded-2xl border p-6">
            <h3 className="text-lg font-bold text-dark mb-3">À propos</h3>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">
              {details?.bio || "Aucune description disponible. Cliquez sur 'Modifier le profil' pour ajouter votre bio."}
            </p>
          </div>

          {/* Featured Badge Info */}
          {details?.is_featured && (
            <div className="bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-100 rounded-2xl p-6 flex items-center gap-4">
              <div className="bg-white p-3 rounded-full shadow-sm">
                <TrendingUp size={24} className="text-primary-600" />
              </div>
              <div>
                <h4 className="font-bold text-primary-800">Profil Mis en Avant</h4>
                <p className="text-sm text-primary-600">Votre profil apparaît en premier dans les recherches.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}