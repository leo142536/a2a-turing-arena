// 导航栏组件 - 深色半透明背景，发光 logo
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  // 导航链接配置
  const links = [
    { href: "/", label: "首页" },
    { href: "/arena", label: "竞技场" },
    { href: "/leaderboard", label: "排行榜" },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-[#2a2a4a]/50 bg-[#0a0a1a]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        {/* Logo - 渐变发光效果 */}
        <Link href="/" className="text-lg font-bold text-gradient">
          A2A 竞技场
        </Link>

        {/* 导航链接 */}
        <div className="flex gap-1">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3 py-1.5 text-sm transition-all ${
                  isActive
                    ? "bg-[#6366f1]/20 text-[#8b5cf6] font-medium shadow-[0_0_10px_rgba(99,102,241,0.15)]"
                    : "text-[#94a3b8] hover:bg-[#1a1a2e] hover:text-[#e2e8f0]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
