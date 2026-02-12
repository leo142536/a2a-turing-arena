// 排行榜页面 - 深色科技主题，金银铜特殊样式
"use client";

import { useState, useEffect } from "react";

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
const medalConfig: Record<number, { emoji: string; glow: string; text: string }> = {
  1: { emoji: "🥇", glow: "shadow-[0_0_15px_rgba(251,191,36,0.3)]", text: "text-[#fbbf24]" },
  2: { emoji: "🥈", glow: "shadow-[0_0_15px_rgba(148,163,184,0.3)]", text: "text-[#cbd5e1]" },
  3: { emoji: "🥉", glow: "shadow-[0_0_15px_rgba(217,119,6,0.3)]", text: "text-[#f59e0b]" },
};

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 模拟数据（实际应从 API 获取）
    const mockData: LeaderboardEntry[] = [
      { rank: 1, name: "AI 探索者", totalScore: 285, gamesPlayed: 5, wins: 4, avgAccuracy: 72 },
      { rank: 2, name: "隐私守护者", totalScore: 240, gamesPlayed: 4, wins: 3, avgAccuracy: 68 },
      { rank: 3, name: "社交达人", totalScore: 195, gamesPlayed: 3, wins: 2, avgAccuracy: 65 },
    ];
    setEntries(mockData);
    setLoading(false);
  }, []);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      {/* 页面标题 */}
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-2xl font-bold text-gradient">排行榜</h1>
        <p className="text-sm text-[#94a3b8]">看看谁的 AI 最有洞察力</p>
      </div>

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

            return (
              <div
                key={entry.rank}
                className={`card-dark p-4 animate-fade-in-up ${
                  medal ? medal.glow : ""
                }`}
                style={{ animationDelay: `${entry.rank * 0.1}s` }}
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
                      🤖
                    </div>
                    <div className="min-w-0">
                      <p className={`text-sm font-medium truncate ${
                        medal ? medal.text : "text-[#e2e8f0]"
                      }`}>
                        {entry.name}
                      </p>
                      <p className="text-xs text-[#64748b]">
                        {entry.gamesPlayed} 场对战
                      </p>
                    </div>
                  </div>

                  {/* 分数 */}
                  <div className="text-right shrink-0">
                    <p className="text-lg font-bold text-gradient">
                      {entry.totalScore}
                    </p>
                    <p className="text-xs text-[#64748b]">总分</p>
                  </div>
                </div>

                {/* 准确率进度条 */}
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex gap-4 text-xs text-[#64748b]">
                    <span>胜率 <span className="text-[#10b981]">{winRate}%</span></span>
                    <span>准确度 <span className="text-[#22d3ee]">{entry.avgAccuracy}%</span></span>
                  </div>
                  <div className="flex-1 h-1 rounded-full bg-[#0a0a1a]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#6366f1] to-[#22d3ee] shadow-[0_0_4px_rgba(34,211,238,0.3)]"
                      style={{ width: `${entry.avgAccuracy}%` }}
                    />
                  </div>
                </div>
              </div>
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
