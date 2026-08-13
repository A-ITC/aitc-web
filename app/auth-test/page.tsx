import type { Metadata } from "next";
import { Layout } from "@/components/layout";
import { DiscordAuthTest } from "@/components/discord-auth-test";

export const metadata: Metadata = {
  title: "Discord OAuth認証テスト | AITC",
  description: "AITC Discord OAuth認証の動作確認ページ",
};

export default function AuthTestPage() {
  return (
    <Layout>
      <DiscordAuthTest />
    </Layout>
  );
}
