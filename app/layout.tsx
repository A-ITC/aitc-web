import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://a-i-t-c.com"),
  title: "AITC | Alumni of Information and Technology Club",
  description: "AITCの活動とメンバーの制作物を紹介するサイト",
  openGraph: {
    title: "AITC | Alumni of Information and Technology Club",
    description: "AITCの活動とメンバーの制作物を紹介するサイト",
    url: "/",
    siteName: "AITC",
    locale: "ja_JP",
    type: "website",
    images: [
      {
        url: "/images/ogp_pic.PNG",
        alt: "AITC",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AITC | Alumni of Information and Technology Club",
    description: "AITCの活動とメンバーの制作物を紹介するサイト",
    images: ["/images/ogp_pic.PNG"],
  },
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
