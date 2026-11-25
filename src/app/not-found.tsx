import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-xl px-4 py-10 text-center">
      <h1 className="text-xl font-bold">Venue not found</h1>
      <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
        It may have been renamed or removed.
      </p>
      <Link
        href="/"
        className="mt-4 inline-block font-medium text-teal-800 underline dark:text-teal-300"
      >
        See all venues
      </Link>
    </main>
  );
}
