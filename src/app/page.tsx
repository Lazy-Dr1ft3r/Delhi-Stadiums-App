import { Explore } from "@/components/explore/Explore";
import { getAllVenues } from "@/lib/data";
import { localISODate } from "@/lib/status";

export default function HomePage() {
  const venues = getAllVenues();
  const hasSamples = venues.some((v) => v.isSample);

  return (
    <main className="mx-auto max-w-xl px-4 py-4">
      <h1 className="sr-only">Delhi Tracks — running tracks in Delhi</h1>
      {hasSamples && (
        <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900 ring-1 ring-amber-200">
          Showing <strong>sample data</strong> only. These venues are fictional and are used to test
          the app.
        </p>
      )}
      <Explore venues={venues} buildDay={localISODate(new Date())} />
    </main>
  );
}
