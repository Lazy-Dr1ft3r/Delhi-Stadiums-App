import { SURFACE_LABELS, yesNo } from "@/lib/labels";
import type { RunningTrackDetails } from "@/lib/schema";
import { InfoList } from "./InfoList";

export function TrackSpecs({ details: d }: { details: RunningTrackDetails }) {
  return (
    <InfoList
      rows={[
        ["Length", `${d.lengthMeters} m`],
        ["Surface", SURFACE_LABELS[d.surface]],
        ["Lanes", d.lanes?.toString()],
        ["Certification", d.certified],
        ["Spikes allowed", yesNo(d.spikesAllowed)],
        ["Floodlights", yesNo(d.floodlights)],
        ["Warm-up area", yesNo(d.warmupArea)],
        ["Field events area", yesNo(d.fieldEventsArea)],
        ["Indoor", yesNo(d.indoor)],
      ]}
    />
  );
}
