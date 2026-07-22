import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AITC | Alumni of Information and Technology Club",
  description: "AITCの活動とメンバーの制作物を紹介するサイト",
  icons: {
    icon: "/images/aitc_logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
