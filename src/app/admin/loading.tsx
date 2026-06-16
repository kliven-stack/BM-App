export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="h-8 w-56 rounded bg-gray-200 dark:bg-white/10" />
      <div className="mt-2 h-4 w-72 rounded bg-gray-200 dark:bg-white/10" />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-2xl bg-gray-200 dark:bg-white/10"
          />
        ))}
      </div>
      <div className="mt-8 h-64 rounded-2xl bg-gray-200 dark:bg-white/10" />
    </div>
  );
}
