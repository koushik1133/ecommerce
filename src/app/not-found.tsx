import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-brand py-24 text-center">
      <p className="text-[11px] tracking-[0.22em] uppercase text-muted mb-3">404</p>
      <h1 className="font-display text-4xl font-bold tracking-tight">
        Page not found
      </h1>
      <p className="mt-3 text-muted">This page hasn&apos;t launched yet.</p>
      <Link
        href="/"
        className="mt-8 inline-flex bg-ink text-chalk px-6 py-3.5 text-sm font-medium hover:bg-accent transition-colors"
      >
        Back home
      </Link>
    </div>
  );
}
