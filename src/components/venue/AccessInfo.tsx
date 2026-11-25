import { PUBLIC_ENTRY_LABELS, yesNo } from "@/lib/labels";
import type { Access } from "@/lib/schema";
import { InfoList } from "./InfoList";

export function AccessInfo({ access }: { access: Access }) {
  return (
    <div>
      <InfoList
        rows={[
          ["Entry", PUBLIC_ENTRY_LABELS[access.publicEntry]],
          ["Hours", access.hours],
          ["Fees", access.fees],
          ["Coaching", yesNo(access.coachingAvailable)],
        ]}
      />
      {access.notes && (
        <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300">{access.notes}</p>
      )}
    </div>
  );
}
