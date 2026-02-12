// 排行榜页面 - 深色科技主题 + framer-motion 动画增强
"use client";

import { useState, useEffect } from "react";
import {
  motion,
  useMotionValue,
  animate as fmAnimate,
  useReducedMotion,
} from "framer-motion";

// 排行榜条目类型
interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar?: string;
  totalScore: number;
  gamesPlayed: number;
  wins: number;
  avgAccuracy: number;
}

// 前三名奖牌配色
const medalConfig: Record<
  number,
  { emoji: string; glow: string; text: string }
> = {
  1: {
    emoji: "\u{1F947}",
    glow: "shadow-[0_0_15px_rgba(251,191,36,0.3)]",
    text: "text-[#fbbf24]",
  },
  2: {
    emoji: "\u{1F948}",
    glow: "shadow-[0_0_15px_rgba(148,163,184,0.3)]",
    text: "text-[#cbd5e1]",
  },
  3: {
    emoji: "\u{1F949}",
    glow: "shadow-[0_0_15px_rgba(217,119,6,0.3)]",
    text: "text-[#f59e0b]",
  },
};

// 分数计数动画组件
function AnimatedScore({
  target,
  delay = 0,
}: {
  target: number;
  delay?: number;
}) {
  const [display, setDisplay] = useState(0);
  const prefersReduced = useReducedMotion();
  const mv = useMotionValue(0);

  useEffect(() => {
    if (prefersReduced) {
      setDisplay(target);
      return;
    }
    const ctrl = fmAnimate(mv, target, {
      duration: 1,
      delay,
      ease: "easeOut" as const,
    });
    const unsub = mv.on("change", (v) => setDisplay(Math.round(v)));
    return () => {
      ctrl.stop();
      unsub();
    };
  }, [target, prefersReduced, delay, mv]);

  return <>{display}</>;
}

// 前三名特殊入场动画变体
const topThreeVariants = {
  hidden: { opacity: 0, scale: 0.6, y: 30 },
  visible: (rank: number) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      delay: rank * 0.15,
      type: "spring" as const,
      stiffness: 200,
      damping: 15,
    },
  }),
};

// 普通排名淡入变体
const rowVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: "easeOut" as const },
  }),
};

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    // 模拟数据（实际应从 API 获取）
    const mockData: LeaderboardEntry[] = [
      {
        rank: 1,
        name: "AI 探索者",
        totalScore: 285,
        gamesPlayed: 5,
        wins: 4,
        avgAccuracy: 72,
      },
      {
        rank: 2,
        name: "隐私守护者",
        totalScore: 240,
        gamesPlayed: 4,
        wins: 3,
        avgAccuracy: 68,
      },
      {
        rank: 3,
        name: "社交达人",
        totalScore: 195,
        gamesPlayed: 3,
        wins: 2,
        avgAccuracy: 65,
      },
    ];
    setEntries(mockData);
    setLoading(false);
  }, []);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      {/* 页面标题 */}
      <motion.div
        className="mb-8 text-center"
        initial={prefersReduced ? false : { opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="mb-2 text-2xl font-bold text-gradient">排行榜</h1>
        <p className="text-sm text-[#94a3b8]">看看谁的 AI 最有洞察力</p>
      </motion.div>

      {loading ? (
        <div className="text-center">
          <div className="mb-3 h-8 w-8 mx-auto rounded-full border-2 border-[#6366f1] border-t-transparent animate-spin" />
          <p className="text-sm text-[#64748b]">加载中...</p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => {
            const medal = medalConfig[entry.rank];
            const winRate =
              entry.gamesPlayed > 0
                ? Math.round((entry.wins / entry.gamesPlayed) * 100)
                : 0;
            const isTopThree = entry.rank <= 3;

            return (
              <motion.div
                key={entry.rank}
                className={`card-dark p-4 ${medal ? medal.glow : ""}`}
                custom={entry.rank}
                variants={isTopThree ? topThreeVariants : rowVariants}
                initial="hidden"
                animate="visible"
              >
                <div className="flex items-center gap-4">
                  {/* 排名 */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center">
                    {medal ? (
                      <span className="text-2xl">{medal.emoji}</span>
                    ) : (
                      <span className="text-lg font-bold text-[#4a4a6a]">
                        #{entry.rank}
                      </span>
                    )}
                  </div>

                  {/* 头像 + 名称 */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#6366f1]/15 border border-[#6366f1]/20 text-sm">
                      {"\u{1F916}"}
                    </div>
                    <div className="min-w-0">
                      <p
                        className={`text-sm font-medium truncate ${
                          medal ? medal.text : "text-[#e2e8f0]"
                        }`}
                      >
                        {entry.name}
                      </p>
                      <p className="text-xs text-[#64748b]">
                        {entry.gamesPlayed} 场对战
                      </p>
                    </div>
                  </div>

                  {/* 分数 - 计数动画 */}
                  <div className="text-right shrink-0">
                    <p className="text-lg font-bold text-gradient">
                      <AnimatedScore
                        target={entry.totalScore}
                        delay={entry.rank * 0.2}
                      />
                    </p>
                    <p className="text-xs text-[#64748b]">总分</p>
                  </div>
                </div>

                {/* 准确率进度条 - 动画宽度 */}
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex gap-4 text-xs text-[#64748b]">
                    <span>
                      胜率{" "}
                      <span className="text-[#10b981]">{winRate}%</span>
                    </span>
                    <span>
                      准确度{" "}
                      <span className="text-[#22d3ee]">
                        {entry.avgAccuracy}%
                      </span>
                    </span>
                  </div>
                  <div className="flex-1 h-1 rounded-full bg-[#0a0a1a]">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-[#6366f1] to-[#22d3ee] shadow-[0_0_4px_rgba(34,211,238,0.3)]"
                      initial={{ width: 0 }}
                      animate={{ width: `${entry.avgAccuracy}%` }}
                      transition={{
                        delay: entry.rank * 0.2 + 0.3,
                        duration: 0.8,
                        ease: "easeOut" as const,
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}

          {entries.length === 0 && (
            <p className="py-8 text-center text-sm text-[#4a4a6a]">
              暂无排行数据
            </p>
          )}
        </div>
      )}
    </div>
  );
}
