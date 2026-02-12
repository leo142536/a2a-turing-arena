// 背景光束效果 - SVG + CSS 动画实现发光光束
"use client";

import { cn } from "@/lib/utils";

// 光束路径数据
const BEAM_PATHS = [
  "M-100 0 Q400 200 900 100",
  "M-50 300 Q500 100 1000 400",
  "M200 -100 Q300 400 800 600",
  "M-200 200 Q600 300 1100 50",
  "M100 -50 Q200 500 700 300",
  "M-150 400 Q350 150 950 500",
];

export function BackgroundBeams({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className
      )}
    >
      <svg
        className="absolute inset-0 h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          {/* 光束渐变定义 */}
          <linearGradient id="beam-grad-1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(99,102,241,0)" />
            <stop offset="50%" stopColor="rgba(99,102,241,0.12)" />
            <stop offset="100%" stopColor="rgba(99,102,241,0)" />
          </linearGradient>
          <linearGradient id="beam-grad-2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(139,92,246,0)" />
            <stop offset="50%" stopColor="rgba(139,92,246,0.1)" />
            <stop offset="100%" stopColor="rgba(139,92,246,0)" />
          </linearGradient>
          <linearGradient id="beam-grad-3" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(34,211,238,0)" />
            <stop offset="50%" stopColor="rgba(34,211,238,0.08)" />
            <stop offset="100%" stopColor="rgba(34,211,238,0)" />
          </linearGradient>
        </defs>

        {BEAM_PATHS.map((d, i) => (
          <path
            key={i}
            d={d}
            fill="none"
            stroke={`url(#beam-grad-${(i % 3) + 1})`}
            strokeWidth={1 + (i % 2)}
            className="beam-path"
            style={{
              animationDelay: `${i * 1.2}s`,
              animationDuration: `${6 + i * 0.8}s`,
            }}
          />
        ))}
      </svg>

      {/* CSS 动画样式 */}
      <style jsx>{`
        .beam-path {
          opacity: 0;
          animation: beam-sweep ease-in-out infinite;
        }
        @keyframes beam-sweep {
          0% {
            opacity: 0;
            stroke-dasharray: 0 1500;
            stroke-dashoffset: 0;
          }
          30% {
            opacity: 1;
          }
          70% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            stroke-dasharray: 1500 1500;
            stroke-dashoffset: -1500;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .beam-path {
            animation: none;
            opacity: 0.05;
            stroke-dasharray: none;
          }
        }
      `}</style>
    </div>
  );
}
