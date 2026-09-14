import type { Metadata } from "next";
import { MembersOnlyEventWorksPage } from "@/components/members-only/members-only-page";

export const metadata: Metadata = {
  title: "作品一覧 | AITC",
  description: "認証済みAITC部員向けのイベント作品一覧",
};

export default function Page() {
  return <MembersOnlyEventWorksPage />;
}
