"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X, Globe, User, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const navLinks = [
  { href: "/", label_fr: "Accueil", label_darija: "Rja3" },
  { href: "/categories", label_fr: "Catégories", label_darija: "F2ayel" },
  { href: "/how-it-works", label_fr: "Comment ça marche", label_darija: "Kifach katskhdm" },
];

export default function Navbar() {
  const router = useRouter();
  const { user, loading, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [lang, setLang] = useState<"fr" | "darija">("fr");

  useEffect(() => {
    const saved = localStorage.getItem("m3allem_lang") as "fr" | "darija" | null;
    if (saved) setLang(saved);
  }, []);

  const toggleLang = () => {
    const newLang = lang === "fr" ? "darija" : "fr";
    setLang(newLang);
    localStorage.setItem("m3allem_lang", newLang);
  };

  const t = (fr: string, darija: string) => (lang === "fr" ? fr : darija);

  const handleSignOut = async () => {
    await signOut();
    router.refresh();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="text-xl font-bold text-primary-700 tracking-tight">M3ALLEM</Link>

        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm font-medium text-gray-600 hover:text-primary-600 transition">
              {t(link.label_fr, link.label_darija)}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <button onClick={toggleLang} className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium hover:bg-gray-50 transition">
            <Globe size={14} /> {lang === "fr" ? "FR" : "Darija"}
          </button>
          
          {loading ? (
            <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
          ) : user ? (
            <div className="flex items-center gap-2">
              <Link href={user.user_metadata?.role === "worker" ? "/worker/dashboard" : "/dashboard"} className="flex items-center gap-1.5 rounded-full bg-primary-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-primary-700 transition">
                <User size={16} /> {t("Profil", "Profil")}
              </Link>
              <button onClick={handleSignOut} className="p-2 text-gray-500 hover:text-red-600 transition" title={t("Déconnexion", "Khruj")}>
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <>
              <Link href="/auth/login" className="text-sm font-medium text-gray-600 hover:text-primary-600 transition">
                {t("Connexion", "Dkhul")}
              </Link>
              <Link href="/auth/register" className="rounded-full bg-primary-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-primary-700 transition">
                {t("Inscription", "Sjell")}
              </Link>
            </>
          )}
        </div>

        <button className="md:hidden p-2 text-gray-600 hover:text-primary-600" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden border-t bg-white px-4 py-4 space-y-3">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setIsOpen(false)} className="block text-base font-medium text-gray-700 hover:text-primary-600 py-2">
              {t(link.label_fr, link.label_darija)}
            </Link>
          ))}
          <div className="pt-3 border-t space-y-2">
            <button onClick={toggleLang} className="flex w-full items-center justify-between rounded-lg border px-3 py-2 text-sm">
              <span className="flex items-center gap-2"><Globe size={16} /> Langue</span>
              <span className="font-medium">{lang === "fr" ? "Français" : "Darija"}</span>
            </button>
            {loading ? (
              <div className="w-full h-10 bg-gray-100 rounded-lg animate-pulse" />
            ) : user ? (
              <button onClick={() => { handleSignOut(); setIsOpen(false); }} className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100 transition">
                <LogOut size={16} /> {t("Déconnexion", "Khruj")}
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link href="/auth/login" onClick={() => setIsOpen(false)} className="rounded-lg border px-3 py-2 text-center text-sm font-medium hover:bg-gray-50">
                  {t("Connexion", "Dkhul")}
                </Link>
                <Link href="/auth/register" onClick={() => setIsOpen(false)} className="rounded-lg bg-primary-600 px-3 py-2 text-center text-sm font-medium text-white hover:bg-primary-700">
                  {t("Inscription", "Sjell")}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}