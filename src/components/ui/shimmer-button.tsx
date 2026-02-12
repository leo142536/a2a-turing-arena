// 闪光按钮 - 带闪光扫过效果的 CTA 按钮
"use client";

import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ShimmerButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  /** 作为链接使用时的包裹标签 */
  asChild?: boolean;
  shimmerColor?: string;
}

export function ShimmerButton({
  children,
  className,
  shimmerColor = "rgba(255,255,255,0.15)",
  ...props
}: ShimmerButtonProps) {
  return (
    <button
      className={cn(
        "group relative inline-flex items-center justify-center overflow-hidden",
        "rounded-full px-8 py-3 text-sm font-medium text-white",
        "bg-gradient-to-r from-[#6366f1] to-[#8b5cf6]",
        "shadow-[0_0_20px_rgba(99,102,241,0.4)]",
        "transition-all duration-300",
        "hover:shadow-[0_0_35px_rgba(139,92,246,0.6)] hover:-translate-y-0.5",
        "active:scale-95",
        "disabled:opacity-50 disabled:pointer-events-none",
        className
      )}
      {...props}
    >
      {/* 闪光扫过层 */}
      <span
        className="absolute inset-0 -translate-x-full group-hover:animate-shimmer-sweep"
        style={{
          background: `linear-gradient(90deg, transparent, ${shimmerColor}, transparent)`,
        }}
      />
      <span className="relative z-10">{children}</span>

      <style jsx>{`
        @keyframes shimmer-sweep {
          to {
            transform: translateX(100%);
          }
        }
        .group:hover .group-hover\\:animate-shimmer-sweep {
          animation: shimmer-sweep 0.8s ease-in-out;
        }
        @media (prefers-reduced-motion: reduce) {
          .group:hover .group-hover\\:animate-shimmer-sweep {
            animation: none;
          }
        }
      `}</style>
    </button>
  );
}
