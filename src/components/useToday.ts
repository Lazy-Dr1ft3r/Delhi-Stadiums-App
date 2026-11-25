"use client";

import { useMemo, useSyncExternalStore } from "react";
import { dayToDate, localISODate } from "@/lib/status";

const subscribe = () => () => {};

/**
 * Today's date for staleness calculations.
 *
 * Pages are statically generated, so the server render uses `buildDay` (the day the page was
 * built). In the browser this switches to the viewer's actual date, so a badge never claims
 * a status is fresher than it is just because the page was built long ago.
 */
export function useToday(buildDay: string): Date {
  const day = useSyncExternalStore(
    subscribe,
    () => localISODate(new Date()),
    () => buildDay,
  );
  return useMemo(() => dayToDate(day), [day]);
}
