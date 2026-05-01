"use client";

import { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left Side: Branding Image */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gray-100">
        <Image
          src="/auth-bg.jpg"
          alt="M3ALLEM - Trouvez le bon artisan"
          fill
          className="object-cover"
          priority
        />
        {/* Optional: Subtle overlay to ensure text readability if you add any later */}
        <div className="absolute inset-0 bg-primary-900/10" />
      </div>

      {/* Right Side: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile Header (Visible only on small screens) */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-block text-2xl font-bold text-primary-700">M3ALLEM</Link>
            <p className="text-gray-500 mt-2">{subtitle}</p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-sm border p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-dark">{title}</h2>
            </div>
            {children}
          </div>

          {/* Footer Links */}
          <p className="text-center text-sm text-gray-500 mt-6">
            En continuant, vous acceptez nos{" "}
            <Link href="/terms" className="text-primary-600 hover:underline">Conditions d'utilisation</Link>
          </p>
        </div>
      </div>
    </div>
  );
}