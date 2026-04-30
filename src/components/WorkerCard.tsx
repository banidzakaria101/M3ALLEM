"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Star, MessageCircle, Phone, CheckCircle } from "lucide-react";
import { getWhatsAppLink, getCallLink } from "@/lib/utils";

interface WorkerCardProps {
  id: string;
  full_name: string;
  profile_image_url: string | null;
  city: string | null;
  years_experience: number;
  rating_avg: number;
  reviews_count: number;
  is_verified: boolean;
  phone: string | null;
  categories: string[];
}

export default function WorkerCard({
  id, full_name, profile_image_url, city, years_experience,
  rating_avg, reviews_count, is_verified, phone, categories
}: WorkerCardProps) {
  return (
    <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300">
      {/* Image */}
      <div className="relative h-48 bg-gray-100">
        {profile_image_url ? (
          <Image
            src={profile_image_url}
            alt={full_name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <span className="text-4xl font-bold opacity-30">{full_name.charAt(0)}</span>
          </div>
        )}
        {is_verified && (
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur rounded-full p-1.5 shadow-sm">
            <CheckCircle className="text-primary-600" size={16} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-bold text-dark text-lg truncate">{full_name}</h3>
          <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
            <MapPin size={14} />
            <span>{city || "Maroc"}</span>
            <span className="mx-1">•</span>
            <span>{years_experience} ans d'exp.</span>
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-1.5">
          {categories.slice(0, 3).map((cat, i) => (
            <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
              {cat}
            </span>
          ))}
          {categories.length > 3 && (
            <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">
              +{categories.length - 3}
            </span>
          )}
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1.5 text-sm">
          <div className="flex items-center gap-0.5 text-amber-500">
            <Star size={14} fill="currentColor" />
            <span className="font-semibold text-dark">{rating_avg.toFixed(1)}</span>
          </div>
          <span className="text-gray-400">({reviews_count} avis)</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Link
            href={getWhatsAppLink(phone)}
            target="_blank"
            className="flex-1 bg-accent-500 hover:bg-accent-600 text-white text-sm font-medium py-2.5 rounded-xl flex items-center justify-center gap-2 transition"
          >
            <MessageCircle size={16} /> WhatsApp
          </Link>
          <Link
            href={getCallLink(phone)}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-dark text-sm font-medium py-2.5 rounded-xl flex items-center justify-center gap-2 transition"
          >
            <Phone size={16} /> Appeler
          </Link>
        </div>
      </div>
    </div>
  );
}