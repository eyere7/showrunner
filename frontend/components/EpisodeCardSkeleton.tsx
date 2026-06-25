export default function EpisodeCardSkeleton() {
  return (
    <div
      className="border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 md:p-6"
      style={{ animation: 'card-enter 400ms var(--ease-out-expo) both' }}
    >
      <div className="flex items-baseline gap-3 mb-5">
        <div className="h-4 w-12 shimmer rounded-sm" />
        <div className="h-6 w-28 shimmer rounded-sm" />
      </div>
      <div className="mb-5">
        <div className="h-3 w-10 shimmer rounded-sm mb-2" />
        <div className="bg-[var(--bg-void)] border border-[var(--border-subtle)] p-4 space-y-2">
          <div className="h-3 w-full shimmer rounded-sm" />
          <div className="h-3 w-5/6 shimmer rounded-sm" />
          <div className="h-3 w-4/5 shimmer rounded-sm" />
          <div className="h-3 w-full shimmer rounded-sm" />
          <div className="h-3 w-3/4 shimmer rounded-sm" />
          <div className="h-3 w-5/6 shimmer rounded-sm" />
          <div className="h-3 w-2/3 shimmer rounded-sm" />
        </div>
      </div>
      <div className="space-y-2 mb-5">
        <div className="h-3 w-14 shimmer rounded-sm" />
        <div className="h-3 w-full shimmer rounded-sm" />
        <div className="h-3 w-3/4 shimmer rounded-sm" />
        <div className="h-3 w-5/6 shimmer rounded-sm" />
      </div>
      <div className="bg-[var(--bg-raised)] border-l-2 border-[var(--accent)] p-4">
        <div className="h-3 w-20 shimmer rounded-sm mb-2" />
        <div className="h-3 w-full shimmer rounded-sm" />
        <div className="h-3 w-4/5 shimmer rounded-sm mt-1.5" />
      </div>
    </div>
  );
}
