import { AUDIENCES, type AudienceKey } from "@/lib/stakeholder-artifacts";
import { AudienceRedirect } from "./redirect-client";

export function generateStaticParams() {
  return AUDIENCES.map((a) => ({ audience: a.key }));
}

/**
 * Legacy deep-link route. The Stakeholders surface was unified into a
 * master/detail at /stakeholders/?audience=<key> in v3. We keep this path
 * static-exportable (so old bookmarks resolve) and bounce to the unified
 * URL so the user lands with the right audience pre-selected.
 */
export default async function AudienceArtifactPage({
  params,
}: {
  params: Promise<{ audience: string }>;
}) {
  const { audience } = await params;
  const valid = AUDIENCES.find((a) => a.key === audience);
  return <AudienceRedirect audience={valid ? (audience as AudienceKey) : null} />;
}
