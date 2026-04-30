"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Upload, Check, Loader2, AlertCircle } from "lucide-react";

interface Category {
  id: string;
  name_fr: string;
  slug: string;
}

export default function WorkerOnboarding() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const supabase = createClient();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    bio: "",
    years_experience: "",
    phone: "",
    city: "",
  });
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Fetch categories & user data on load
  useEffect(() => {
    if (user) {
      loadCategories();
      loadUserProfile();
    }
  }, [user]);

  const loadCategories = async () => {
    const { data } = await supabase.from("categories").select("id, name_fr, slug");
    if (data) setCategories(data);
  };

  const loadUserProfile = async () => {
    if (!user) return;
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    const { data: details } = await supabase.from("worker_details").select("*").eq("id", user.id).single();
    const { data: workerCats } = await supabase.from("worker_categories").select("category_id").eq("worker_id", user.id);

    if (profile) {
      setFormData(prev => ({ ...prev, phone: profile.phone || "", city: profile.city || "" }));
    }
    if (details) {
      setFormData(prev => ({ ...prev, bio: details.bio || "", years_experience: String(details.years_experience || "") }));
      setImagePreview(details.profile_image_url || null);
    }
    if (workerCats) {
      setSelectedCategories(workerCats.map(c => c.category_id));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const toggleCategory = (id: string) => {
    setSelectedCategories(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError("");

    try {
      let imageUrl = imagePreview;

      // 1. Upload Image if changed
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("profiles")
          .upload(fileName, imageFile);
        
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage.from("profiles").getPublicUrl(fileName);
        imageUrl = publicUrl;
      }

      // 2. Update Profiles (City/Phone)
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ 
          phone: formData.phone,
          is_approved: true // Auto-approve for MVP
        })
        .eq("id", user.id);

      if (profileError) throw profileError;

      // 3. Update Worker Details
      const { error: detailsError } = await supabase
        .from("worker_details")
        .upsert({
          id: user.id,
          bio: formData.bio,
          years_experience: parseInt(formData.years_experience) || 0,
          profile_image_url: imageUrl,
          rating_avg: 0,
          reviews_count: 0,
        });

      if (detailsError) throw detailsError;

      // 4. Update Categories
      // Delete existing
      await supabase.from("worker_categories").delete().eq("worker_id", user.id);
      // Insert new
      if (selectedCategories.length > 0) {
        const newCats = selectedCategories.map(catId => ({ worker_id: user.id, category_id: catId }));
        const { error: catError } = await supabase.from("worker_categories").insert(newCats);
        if (catError) throw catError;
      }

      setSuccess(true);
      setTimeout(() => router.push("/"), 1500);

    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return <div className="p-8 text-center">Chargement...</div>;
  if (!user || user.user_metadata?.role !== 'worker') {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-red-600">Accès refusé</h2>
        <p>Seuls les artisans peuvent accéder à cette page.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl py-8 px-4">
      <div className="bg-white rounded-2xl shadow-sm border p-8">
        <h2 className="text-2xl font-bold text-dark mb-2">Compléter votre profil</h2>
        <p className="text-gray-500 mb-6">Rendez votre profil visible pour les clients.</p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
            <AlertCircle size={16} /> {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700 text-sm">
            <Check size={16} /> Profil enregistré avec succès ! Redirection...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Photo de profil</label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gray-100 overflow-hidden border flex items-center justify-center">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <Upload className="text-gray-400" size={24} />
                )}
              </div>
              <label className="cursor-pointer bg-white border px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
                Choisir une photo
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
            </div>
          </div>

          {/* Bio & Experience */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Années d'expérience</label>
              <input
                type="number"
                value={formData.years_experience}
                onChange={(e) => setFormData({ ...formData, years_experience: e.target.value })}
                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="Ex: 5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="Ex: Casablanca"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio / Description</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none h-24 resize-none"
              placeholder="Décrivez vos services, votre expertise..."
            />
          </div>

          {/* Categories */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Services proposés</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggleCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
                    selectedCategories.includes(cat.id)
                      ? "bg-primary-600 text-white border-primary-600"
                      : "bg-white text-gray-600 border-gray-200 hover:border-primary-500"
                  }`}
                >
                  {cat.name_fr}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />}
            {loading ? "Enregistrement..." : "Sauvegarder le profil"}
          </button>
        </form>
      </div>
    </div>
  );
}