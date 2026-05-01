import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "M3ALLEM | Artisans de Confiance au Maroc",
  description: "Trouvez rapidement des plombiers, électriciens, peintres et artisans vérifiés dans votre ville au Maroc.",
  keywords: "plombier maroc, électricien casa, artisan maroc, معلم مغرب, بومباجي",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased bg-gray-50 text-dark min-h-screen font-sans flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
          {children}
        </main>
        <footer className="border-t bg-white mt-auto py-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} M3ALLEM • Fait avec ❤️ au Maroc 🇲🇦
        </footer>
      </body>
    </html>
  );
}