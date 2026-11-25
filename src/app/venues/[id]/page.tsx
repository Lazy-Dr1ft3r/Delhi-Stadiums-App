import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AccessInfo } from "@/components/venue/AccessInfo";
import { InfoList } from "@/components/venue/InfoList";
import { SampleTag } from "@/components/venue/SampleTag";
import { StatusBadge } from "@/components/venue/StatusBadge";
import { TrackSpecs } from "@/components/venue/TrackSpecs";
import { getAllVenues, getVenueById } from "@/lib/data";
import { runningTracks } from "@/lib/filters";
import { directionsUrl } from "@/lib/geo";
import { OPERATOR_LABELS } from "@/lib/labels";
import { localISODate } from "@/lib/status";

type Params = { params: Promise<{ id: string }> };

// Every venue page is generated at build time; unknown ids 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllVenues().map((v) => ({ id: v.id }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const venue = getVenueById((await params).id);
  if (!venue) return {};
  return {
    title: venue.name,
    description: `Running track at ${venue.name}, ${venue.locality}: surface, access, hours and verified status.`,
  };
}

export default async function VenuePage({ params }: Params) {
  const venue = getVenueById((await params).id);
  if (!venue) notFound();

  const buildDay = localISODate(new Date());
  const tracks = runningTracks(venue);

  return (
    <main className="mx-auto max-w-xl px-4 py-4 pb-28">
      <Link href="/" className="text-sm font-medium text-teal-800 dark:text-teal-300">
        ← All venues
      </Link>

      {venue.isSample && (
        <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900 ring-1 ring-amber-200">
          <strong>Sample data.</strong> This venue is fictional and is used to test the app.
        </p>
      )}

      <header className="mt-3">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold">{venue.name}</h1>
          {venue.isSample && <SampleTag />}
        </div>
        {venue.aliases.length > 0 && (
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Also known as {venue.aliases.join(", ")}
          </p>
        )}
        <p className="mt-1 text-sm">
          {venue.address}
          {venue.locality && !venue.address.includes(venue.locality) ? `, ${venue.locality}` : ""}
        </p>
      </header>

      {tracks.map((track) => (
        <section
          key={track.id}
          aria-labelledby={`${track.id}-heading`}
          className="mt-6 rounded-xl border border-neutral-200 p-4 dark:border-neutral-800"
        >
          <h2 id={`${track.id}-heading`} className="text-lg font-semibold">
            {tracks.length > 1 ? `${track.details.lengthMeters}m track` : "Running track"}
          </h2>
          <div className="mt-2">
            <StatusBadge status={track.status} buildDay={buildDay} />
          </div>

          <h3 className="mt-5 text-sm font-semibold tracking-wide text-neutral-500 uppercase">
            Track
          </h3>
          <TrackSpecs details={track.details} />

          <h3 className="mt-5 text-sm font-semibold tracking-wide text-neutral-500 uppercase">
            Access
          </h3>
          <AccessInfo access={track.access} />
        </section>
      ))}

      <section aria-labelledby="venue-heading" className="mt-6">
        <h2
          id="venue-heading"
          className="text-sm font-semibold tracking-wide text-neutral-500 uppercase"
        >
          Venue
        </h2>
        <InfoList
          rows={[
            ["Operator", venue.operatorName ?? OPERATOR_LABELS[venue.operator]],
            ["District", venue.district],
            ["Phone", venue.phone],
          ]}
        />
        {venue.website && (
          <a
            href={venue.website}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-sm font-medium text-teal-800 underline dark:text-teal-300"
          >
            Official website
          </a>
        )}
      </section>

      {/* Primary actions sit at the bottom, within thumb reach. */}
      <div className="fixed inset-x-0 bottom-0 border-t border-neutral-200 bg-white/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/95">
        <div className="mx-auto flex max-w-xl gap-3">
          <a
            href={directionsUrl(venue.coordinates)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-12 flex-1 items-center justify-center rounded-xl bg-teal-700 font-semibold text-white"
          >
            Directions
          </a>
          <button
            type="button"
            disabled
            title="Coming soon"
            className="min-h-12 flex-1 rounded-xl border border-neutral-300 text-sm font-medium text-neutral-500 dark:border-neutral-700"
          >
            Report an update
            <span className="block text-xs">coming soon</span>
          </button>
        </div>
      </div>
    </main>
  );
}
