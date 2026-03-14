export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="h-32 animate-pulse rounded-[2rem] bg-slate-200/70 dark:bg-slate-800/70" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-36 animate-pulse rounded-[2rem] bg-slate-200/70 dark:bg-slate-800/70" />
        ))}
      </div>
      <div className="h-[28rem] animate-pulse rounded-[2rem] bg-slate-200/70 dark:bg-slate-800/70" />
    </div>
  );
}
