import Link from "next/link";

export function MetricCard({ label, value, delta, href }: { label: string; value: string; delta: string; href?: string }) {
  const content = (
    <>
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-4 text-4xl font-semibold tracking-tight">{value}</p>
      <p className="mt-2 text-sm text-cyan-500">{delta}</p>
    </>
  );

  if (href) {
    return (
      <Link href={href} className="card-surface block rounded-[2rem] p-5 transition hover:-translate-y-0.5 hover:border-cyan-300/40">
        {content}
      </Link>
    );
  }

  return (
    <div className="card-surface rounded-[2rem] p-5">
      {content}
    </div>
  );
}
