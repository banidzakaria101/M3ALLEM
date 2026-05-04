"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Mail, Lock, AlertCircle, Loader2 } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError("Email ou mot de passe incorrect");
      setLoading(false);
      return;
    }

    // Simple redirect to home for now (role-based redirect can be added later)
    router.push("/");
    router.refresh();
  };

  return (
    <AuthLayout title="Connexion" subtitle="Accédez à votre espace M3ALLEM">
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
          <AlertCircle size={16} /> {error}
        </div>
      )}
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="email" 
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition" 
              placeholder="vous@email.com" 
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="password" 
              required 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition" 
              placeholder="••••••••" 
            />
          </div>
        </div>
        <button 
          type="submit" 
          disabled={loading} 
          className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
        >
          {loading ? <><Loader2 className="animate-spin" size={18} /> Connexion...</> : "Se connecter"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-600">
        Pas encore de compte ? <Link href="/auth/register" className="text-primary-600 font-medium hover:underline">Créer un compte</Link>
      </p>
    </AuthLayout>
  );
}