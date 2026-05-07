import initiativesJson from "@/data/initiatives.json";
import type { Initiative } from "@/lib/types";

const initiatives = initiativesJson as Initiative[];

export function generateStaticParams() {
  return initiatives.map((i) => ({ id: i.id }));
}

export default async function InitiativeDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const initiative = initiatives.find((i) => i.id === id);

  return (
    <div className="min-h-screen bg-page text-primary">
      <main className="mx-auto max-w-[720px] px-8 py-16">
        <a href="/" className="text-sm text-secondary hover:text-primary">
          ← Back
        </a>
        <h1 className="mt-8 text-2xl font-semibold tracking-tight">
          {initiative?.title ?? "Not found"}
        </h1>
        <p className="mt-12 text-xs text-tertiary">
          Initiative Detail screen is the unique-design moment. Build pass next.
        </p>
      </main>
    </div>
  );
}
