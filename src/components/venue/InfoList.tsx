import { NOT_CONFIRMED } from "@/lib/labels";

/** A definition list where missing values render as "Not confirmed" in a muted style. */
export function InfoList({ rows }: { rows: [label: string, value: string | undefined][] }) {
  return (
    <dl className="divide-y divide-neutral-200 dark:divide-neutral-800">
      {rows.map(([label, value]) => {
        const missing = value === undefined || value === NOT_CONFIRMED;
        return (
          <div key={label} className="flex justify-between gap-4 py-2 text-sm">
            <dt className="text-neutral-600 dark:text-neutral-400">{label}</dt>
            <dd className={`text-right ${missing ? "text-neutral-500 italic" : "font-medium"}`}>
              {missing ? NOT_CONFIRMED : value}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
