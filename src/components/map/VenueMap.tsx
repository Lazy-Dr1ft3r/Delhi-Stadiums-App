"use client";

// Client-only: Leaflet touches `window`. Always load via next/dynamic with { ssr: false }.
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { useEffect } from "react";
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from "react-leaflet";
import type { VenueResult } from "@/lib/filters";
import { DELHI_CENTER, type LatLng } from "@/lib/geo";
import { getStatusDisplay } from "@/lib/status";
import { TONE_HEX } from "../venue/tone";

interface Props {
  results: VenueResult[];
  today: Date;
  origin?: LatLng;
}

/** Fit the map to the visible venues (and the user, if located) whenever they change. */
function FitBounds({ points }: { points: LatLng[] }) {
  const map = useMap();
  const key = points.map((p) => `${p.lat},${p.lng}`).join("|");
  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) map.setView(points[0]!, 14);
    else
      map.fitBounds(
        points.map((p) => [p.lat, p.lng] as [number, number]),
        { padding: [32, 32] },
      );
    // `key` captures the points' identity; re-running on every array instance would fight the user.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, key]);
  return null;
}

export default function VenueMap({ results, today, origin }: Props) {
  const points = results.map((r) => r.venue.coordinates);
  if (origin) points.push(origin);

  return (
    <MapContainer center={DELHI_CENTER} zoom={11} className="h-full w-full" scrollWheelZoom>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds points={points} />

      {results.map(({ venue, track }) => {
        const status = getStatusDisplay(track.status, today);
        return (
          <CircleMarker
            key={venue.id}
            center={venue.coordinates}
            radius={10}
            pathOptions={{
              color: "#ffffff",
              weight: 2,
              fillColor: TONE_HEX[status.tone],
              fillOpacity: 1,
            }}
          >
            <Popup>
              <Link href={`/venues/${venue.id}`} className="font-semibold">
                {venue.name}
              </Link>
              <br />
              {status.label} · verified {status.ageText}
            </Popup>
          </CircleMarker>
        );
      })}

      {origin && (
        <CircleMarker
          center={origin}
          radius={7}
          pathOptions={{ color: "#ffffff", weight: 2, fillColor: "#2563eb", fillOpacity: 1 }}
        >
          <Popup>You are here</Popup>
        </CircleMarker>
      )}
    </MapContainer>
  );
}
