"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Mail, Lock, User, Phone, AlertCircle, Loader2, MapPin, Briefcase } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";

interface Category {
  id: string;
  name_fr: string;
}

interface City {
  id: string;
  name_fr: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    role: "customer" as "customer" | "worker",
    categoryId: "",
    cityId: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [dropdownsLoading, setDropdownsLoading] = useState(true);

  useEffect(() => {
    const fetchDropdownData = async () => {
      const supabase = createClient();
      
      try {
        const [catsRes, citiesRes] = await Promise.all([
          supabase.from("categories").select("id, name_fr").order("name_fr"),
          supabase.from("cities").select("id, name_fr").order("name_fr"),
        ]);
        
        if (catsRes.data) setCategories(catsRes.data);
        if (citiesRes.data) setCities(citiesRes.data);
      } catch (err) {
        console.error("Error fetching dropdown data:", err);
      } finally {
        setDropdownsLoading(false);
      }
    };
    fetchDropdownData();
  }, []);

  const formatPhone = (val: string) => {
    const digits = val.replace(/\D/g, "");
    if (digits.startsWith("212")) return `+${digits}`;
    if (digits.startsWith("0")) return `+212${digits.slice(1)}`;
    return `+212${digits}`;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.role === "worker" && (!formData.categoryId || !formData.cityId)) {
      setError("Les artisans doivent sélectionner une spécialité et une ville.");
      return;
    }

    setLoading(true);
    setError("");

    const supabase = createClient();
    
    // ✅ FIXED: Correct options syntax with 'data' key
    const { data, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.fullName,
        },
      },
    });

    if (authError) {
      setError(authError.message.includes("rate limit") 
        ? "Trop de tentatives. Réessayez plus tard."
        : authError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      await supabase.from("profiles").update({
        full_name: formData.fullName,
        phone: formatPhone(formData.phone),
        role: formData.role,
        city_id: formData.cityId || null,
      }).eq("id", data.user.id);

      if (formData.role === "worker" && formData.categoryId) {
        await supabase.from("worker_categories").insert({
          worker_id: data.user.id,
          category_id: formData.categoryId,
        });
      }
    }

    router.push("/auth/login?registered=true");
  };

  return (
    <AuthLayout title="Créer un compte" subtitle="Rejoignez la communauté M3ALLEM">
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {dropdownsLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="animate-spin text-primary-600" size={32} />
        </div>
      ) : (
        <form onSubmit={handleRegister} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input required value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} className="w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition" placeholder="Ahmed Alami" />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition" placeholder="vous@email.com" />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone (WhatsApp)</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="tel" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition" placeholder="06 12 34 56 78" />
            </div>
            <p className="text-xs text-gray-400 mt-1">Formaté automatiquement en +212</p>
          </div>

          {/* City Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <select 
                value={formData.cityId}
                onChange={(e) => setFormData({ ...formData, cityId: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition appearance-none bg-white"
              >
                <option value="">Sélectionnez votre ville</option>
                {cities.map(city => (
                  <option key={city.id} value={city.id}>{city.name_fr}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="password" required minLength={6} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition" placeholder="Min. 6 caractères" />
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Je suis un(e)</label>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <button type="button" onClick={() => setFormData({ ...formData, role: "customer" })} className={`p-3 border rounded-xl text-sm font-medium transition ${formData.role === "customer" ? "border-primary-600 bg-primary-50 text-primary-700" : "hover:bg-gray-50"}`}>Client</button>
              <button type="button" onClick={() => setFormData({ ...formData, role: "worker" })} className={`p-3 border rounded-xl text-sm font-medium transition ${formData.role === "worker" ? "border-primary-600 bg-primary-50 text-primary-700" : "hover:bg-gray-50"}`}>Artisan</button>
            </div>

            {/* Category Dropdown - Only shows for workers */}
            {formData.role === "worker" && (
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Spécialité</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <select 
                    required={formData.role === "worker"}
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition appearance-none bg-white"
                  >
                    <option value="">Sélectionnez votre métier</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name_fr}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          <button type="submit" disabled={loading} className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2">
            {loading ? <><Loader2 className="animate-spin" size={18} /> Création...</> : "S'inscrire"}
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-gray-600">
        Déjà un compte ? <Link href="/auth/login" className="text-primary-600 font-medium hover:underline">Se connecter</Link>
      </p>
    </AuthLayout>
  );
}