import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";
import WorkerCard from "@/components/WorkerCard";
import SearchFilter from "@/components/SearchFilter";
import { MapPin } from "lucide-react";

interface SearchParams {
  city?: string;
  search?: string;
}

interface WorkerData {
  id: string;
  full_name: string;
  profile_image_url: string | null;
  city: string | null;
  years_experience: number;
  rating_avg: number;
  reviews_count: number;
  is_verified: boolean;
  is_featured: boolean;
  phone: string | null;
  categories: string[];
}

async function getWorkers(params: SearchParams): Promise<WorkerData[]> {
  const supabase = await createClient();
  
  // ✅ Removed .order() - PostgREST doesn't support ordering by embedded tables
  const { data, error } = await supabase
    .from("profiles")
    .select(`
      id, full_name, phone, is_verified, is_approved,
      worker_details!fk_worker_details_profile (years_experience, profile_image_url, rating_avg, reviews_count, is_featured),
      cities (name_fr),
      worker_categories!fk_worker_categories_profile (
        category_id,
        categories (name_fr)
      )
    `)
    .eq("role", "worker")
    .eq("is_approved", true);

  if (error) {
    console.error("Supabase error:", error);
    return [];
  }

  // Transform nested response into flat props
  let workers: WorkerData[] = data.map((w: any) => ({
    id: w.id,
    full_name: w.full_name,
    profile_image_url: w.worker_details?.profile_image_url || null,
    city: w.cities?.name_fr || null,
    years_experience: w.worker_details?.years_experience || 0,
    rating_avg: w.worker_details?.rating_avg || 0,
    reviews_count: w.worker_details?.reviews_count || 0,
    is_verified: w.is_verified,
    is_featured: w.worker_details?.is_featured || false,
    phone: w.phone,
    categories: w.worker_categories
      ?.map((wc: any) => wc.categories?.name_fr as string)
      .filter(Boolean) || []
  }));

  // ✅ Client-side sorting: Featured first → then highest rating
  workers.sort((a, b) => {
    if (a.is_featured !== b.is_featured) return a.is_featured ? -1 : 1;
    return (b.rating_avg || 0) - (a.rating_avg || 0);
  });

  // Apply search/city filters
  if (params.city) workers = workers.filter(w => w.city?.toLowerCase() === params.city?.toLowerCase());
  if (params.search) {
    const q = params.search.toLowerCase();
    workers = workers.filter(w => 
      w.full_name.toLowerCase().includes(q) || 
      w.city?.toLowerCase().includes(q) ||
      w.categories.some((c: string) => c.toLowerCase().includes(q))
    );
  }

  return workers;
}

export default function Home({ searchParams }: { searchParams: Promise<SearchParams> }) {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Chargement des artisans...</div>}>
      <HomeContent searchParams={searchParams} />
    </Suspense>
  );
}

async function HomeContent({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const workers = await getWorkers(params);

  return (
    <div className="space-y-6">
      <SearchFilter />

      {workers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {workers.map((worker) => (
            <WorkerCard key={worker.id} {...worker} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed">
          <MapPin className="mx-auto text-gray-300 mb-4" size={48} />
          <h3 className="text-xl font-semibold text-gray-700">Aucun artisan trouvé</h3>
          <p className="text-gray-500 mt-2">Essayez de modifier vos critères de recherche.</p>
        </div>
      )}
    </div>
  );
}