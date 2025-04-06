import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Header from "./components/common/header";
import Footer from "./components/common/footer";

import { Noto_Sans_JP } from "next/font/google";
import { AuthProvider } from "./lib/authContext";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "A-ITC",
  description: "A-ITCは東京理科大学葛飾キャンパスで活動している ITC の卒業生で構成されるグループです",
  metadataBase: new URL("https://aitc.eulious.com/kyoichi"),
  openGraph: {
    title: 'A-ITC',
    description: 'A-ITCは東京理科大学葛飾キャンパスで活動している ITC の卒業生で構成されるグループです',
    url: 'https://aitc.eulious.com/kyoichi', // デプロイ後の URL
    siteName: 'MySite',
    images: [
      {
        url: 'https://aitc.eulious.com/kyoichi/twitter-image.png', // ローカル画像を絶対パスで指定
        width: 1280,
        height: 720,
        alt: 'MySite Preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'A-ITC',
    description: 'A-ITCは東京理科大学葛飾キャンパスで活動している ITC の卒業生で構成されるグループです',
    images: ['https://aitc.eulious.com/kyoichi/twitter-image.png'], // Twitter でも同じ画像を使用可能
  },
};

const NotoSansFont = Noto_Sans_JP({ weight: "400", subsets: ["latin"] });

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${NotoSansFont.className} ${geistSans.variable} ${geistMono.variable} antialiasedstatic flex flex-col min-h-screen`}
      >
        <div className="sticky top-0 w-full  z-40">
          <Header />
        </div>
        <div className="flex-grow my-10">
          {children}
        </div>
        <div className="w-full">
          <Footer />
        </div>
      </body>
    </html>
  );
}
