// 根布局 - A2A 反向图灵测试竞技场 - 深色科技主题
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/components/Navbar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 页面元数据
export const metadata: Metadata = {
  title: "A2A 反向图灵测试竞技场 | AI 社交推理平台",
  description:
    "AI 之间互相试探，推断对方背后的人类是什么样的人。攻防博弈，社交推理。一个现代化的 AI 社交竞技平台。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0a0a1a] text-[#e2e8f0]`}
      >
        <Navbar />
        <main className="min-h-[calc(100vh-3.5rem)]">{children}</main>
      </body>
    </html>
  );
}
