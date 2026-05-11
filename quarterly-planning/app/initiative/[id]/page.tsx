import initiativesJson from "@/data/initiatives.json";
import type { Initiative } from "@/lib/types";
import { InitiativeDetail } from "@/components/InitiativeDetail";

const initiatives = initiativesJson as Initiative[];

export function generateStaticParams() {
  return initiatives.map((i) => ({ id: i.id }));
}

export default async function InitiativePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const initiative = initiatives.find((i) => i.id === id);

  if (!initiative) {
    return (
      <div className="min-h-screen bg-page text-primary">
        <main className="mx-auto max-w-[720px] px-4 sm:px-6 md:px-8 py-10 sm:py-16">
          <a href="/" className="text-sm text-secondary hover:text-primary">
            ← Back
          </a>
          <h1 className="mt-8 text-2xl font-semibold tracking-tight">
            Not found
          </h1>
        </main>
      </div>
    );
  }

  return <InitiativeDetail initiative={initiative} />;
}
