import type { Metadata } from "next";
import { MembersOnlyPage } from "@/components/members-only-page";

export const metadata: Metadata = {
  title: "部員向け | AITC",
  description: "認証済みAITC部員向けのメンバー一覧",
};

export default function Page() {
  return <MembersOnlyPage />;
}
