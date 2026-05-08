import { StakeholderArtifact } from "@/components/StakeholderArtifact";
import { AUDIENCES, type AudienceKey } from "@/lib/stakeholder-artifacts";

export function generateStaticParams() {
  return AUDIENCES.map((a) => ({ audience: a.key }));
}

export default async function AudienceArtifactPage({
  params,
}: {
  params: Promise<{ audience: string }>;
}) {
  const { audience } = await params;
  const valid = AUDIENCES.find((a) => a.key === audience);
  if (!valid) {
    return (
      <main className="mx-auto max-w-[720px] px-6 py-16 text-primary">
        <a href="/stakeholders/" className="text-sm">← Back</a>
        <h1 className="mt-6 text-2xl font-semibold tracking-tight">Audience not found</h1>
      </main>
    );
  }
  return <StakeholderArtifact audience={audience as AudienceKey} />;
}
