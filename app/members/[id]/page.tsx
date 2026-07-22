import { MemberPage } from "@/components/site";
import members from "@/data/members.json";

export function generateStaticParams() {
  return members.map(({ id }) => ({ id }));
}
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <MemberPage id={(await params).id} />;
}
