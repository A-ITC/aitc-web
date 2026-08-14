import type { Metadata } from "next";
import { MembersOnlyMemberPage } from "@/components/members-only/members-only-page";

export const metadata: Metadata = {
  title: "部員プロフィール | AITC",
  description: "認証済みAITC部員向けのメンバープロフィール",
};

export default function Page() {
  return <MembersOnlyMemberPage />;
}
