import { redirect } from "next/navigation";

export default async function SourcesPage({
  params,
}: {
  params: Promise<{ agentId: string }>;
}) {
  const data = await params;
  redirect(`/dashboard/agent/${data.agentId}/sources/files`);
}
