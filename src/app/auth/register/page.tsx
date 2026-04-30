"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Mail, Lock, User, Phone, AlertCircle } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    role: "customer" as "customer" | "worker",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const formatPhone = (val: string) => {
    const digits = val.replace(/\D/g, "");
    if (digits.startsWith("212")) return `+${digits}`;
    if (digits.startsWith("0")) return `+212${digits.slice(1)}`;
    return `+212${digits}`;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: { data: { full_name: formData.fullName } },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // Update profile with phone & role
    if (data.user) {
      await supabase.from("profiles").update({
        full_name: formData.fullName,
        phone: formatPhone(formData.phone),
        role: formData.role,
      }).eq("id", data.user.id);
    }

    router.push("/auth/login?registered=true");
  };

  return (
    <div className="mx-auto max-w-md py-12 px-4">
      <div className="bg-white rounded-2xl shadow-sm border p-8">
        <h2 className="text-2xl font-bold text-dark mb-2">Créer un compte</h2>
        <p className="text-gray-500 mb-6">Rejoignez la communauté M3ALLEM</p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition"
                placeholder="Ahmed Alami"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition"
                placeholder="vous@email.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone (WhatsApp)</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition"
                placeholder="06 12 34 56 78"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">Formaté automatiquement en +212</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="password"
                required
                minLength={6}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition"
                placeholder="Min. 6 caractères"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Je suis un(e)</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: "customer" })}
                className={`p-3 border rounded-xl text-sm font-medium transition ${formData.role === "customer" ? "border-primary-600 bg-primary-50 text-primary-700" : "hover:bg-gray-50"}`}
              >
                Client
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: "worker" })}
                className={`p-3 border rounded-xl text-sm font-medium transition ${formData.role === "worker" ? "border-primary-600 bg-primary-50 text-primary-700" : "hover:bg-gray-50"}`}
              >
                Artisan / Ouvrier
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Création du compte..." : "S'inscrire"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Déjà un compte ?{" "}
          <Link href="/auth/login" className="text-primary-600 font-medium hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}