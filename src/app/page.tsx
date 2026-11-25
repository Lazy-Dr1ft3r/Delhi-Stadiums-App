import { getAllVenues } from "@/lib/data";

// M0 placeholder: proves data loads and validates at build time.
// The real Explore screen (map + list + filters) is M1.
export default function HomePage() {
  const venues = getAllVenues();

  return (
    <main className="mx-auto max-w-xl px-4 py-6">
      <h1 className="text-2xl font-bold">Delhi Tracks</h1>
      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
        Scaffold (M0). The Explore screen with map, list and filters comes in M1.
      </p>

      <ul className="mt-6 space-y-3">
        {venues.map((v) => (
          <li
            key={v.id}
            className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-800"
          >
            <div className="flex items-center gap-2">
              <span className="font-medium">{v.name}</span>
              {v.isSample && (
                <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs font-semibold text-amber-900">
                  SAMPLE
                </span>
              )}
            </div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400">
              {v.locality} · {v.facilities.length} facility(ies)
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
