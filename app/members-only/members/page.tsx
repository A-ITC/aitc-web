import type { Metadata } from "next";
import { MembersOnlyMembersPage } from "@/components/members-only/members-only-page";

export const metadata: Metadata = {
  title: "メンバー一覧 | AITC",
  description: "認証済みAITC部員向けのメンバー一覧とプロフィール",
};

export default function Page() {
  return <MembersOnlyMembersPage />;
}
