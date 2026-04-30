"use client";
import { createContext, useContext, useState, useEffect } from "react";

export type Lang = "fr" | "darija";

const translations: Record<Lang, Record<string, string>> = {
  fr: {
    hero_title: "Trouvez des artisans de confiance au Maroc",
    hero_subtitle: "Plombiers, électriciens, peintres et plus encore. Contactez-les directement.",
    browse: "Parcourir",
    login: "Connexion",
    register: "Inscription",
    verified: "Vérifié",
    contact_whatsapp: "WhatsApp",
    contact_call: "Appeler",
    loading: "Chargement...",
  },
  darija: {
    hero_title: "Lqa 7refyin mt9yn f lmaghrib",
    hero_subtitle: "Bumbaji, courant, peinture w ktar. Twasel m3ahom direct.",
    browse: "Chouf",
    login: "Dkhul",
    register: "Sjell",
    verified: "Mw99el",
    contact_whatsapp: "WhatsApp",
    contact_call: "Itṣel",
    loading: "Katswer...",
  }
};

type ContextType = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
};

const LangContext = createContext<ContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("fr");

  // Persist preference
  useEffect(() => {
    const saved = localStorage.getItem("m3allem_lang") as Lang | null;
    if (saved) setLang(saved);
  }, []);

  const switchLang = (l: Lang) => {
    setLang(l);
    localStorage.setItem("m3allem_lang", l);
  };

  const t = (key: string) => translations[lang][key] || key;

  return (
    <LangContext.Provider value={{ lang, setLang: switchLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLanguage = () => {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
};