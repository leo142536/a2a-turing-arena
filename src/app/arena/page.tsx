// 竞技场大厅 - 2D 空间可视化 + 深色科技主题
"use client";

import { useState, useEffect, useMemo } from "react";
import GameCard from "@/components/GameCard";

// 游戏数据类型
interface GameData {
  id: string;
  status: string;
  playerA: { name: string };
  playerB?: { name: string };
  currentRound: number;
  rounds: number;
  createdAt: string;
}

// AI 头像数据（用于 2D 空间可视化）
const AI_AVATARS = [
  { emoji: "🤖", name: "探索者", x: 15, y: 25 },
  { emoji: "🧠", name: "思考家", x: 45, y: 15 },
  { emoji: "👾", name: "守护者", x: 75, y: 35 },
  { emoji: "🎭", name: "社交达人", x: 25, y: 65 },
  { emoji: "🔮", name: "预言师", x: 60, y: 55 },
  { emoji: "🦊", name: "狐狸AI", x: 85, y: 70 },
  { emoji: "🐉", name: "龙之灵", x: 35, y: 45 },
  { emoji: "⚡", name: "闪电侠", x: 55, y: 80 },
];

// 匹配连线（正在对战的 AI 之间的连线索引）
const MATCH_LINES = [
  { from: 0, to: 2 },
  { from: 3, to: 4 },
];

export default function ArenaPage() {
  const [games, setGames] = useState<GameData[]>([]);
  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState(false);
  const [error, setError] = useState("");

  // 为每个头像生成动画延迟
  const floatDelays = useMemo(
    () => AI_AVATARS.map((_, i) => `${i * 0.4}s`),
    []
  );

  // 加载游戏列表
  useEffect(() => {
    fetchGames();
  }, []);

  async function fetchGames() {
    try {
      const res = await fetch("/api/game/match");
      if (res.ok) {
        const data = await res.json();
        setGames(data.games || []);
      }
    } catch {
      setError("加载游戏列表失败");
    } finally {
      setLoading(false);
    }
  }

  // 开始匹配
  async function handleMatch() {
    setMatching(true);
    setError("");
    try {
      const res = await fetch("/api/game/match", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "匹配失败");
        return;
      }
      window.location.href = `/arena/${data.gameId}`;
    } catch {
      setError("网络错误，请重试");
    } finally {
      setMatching(false);
    }
  }

  // 按状态分组
  const activeGames = games.filter((g) =>
    ["PLAYING", "GUESSING", "WAITING"].includes(g.status)
  );
  const finishedGames = games.filter((g) => g.status === "FINISHED");

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      {/* 页面标题 */}
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-2xl font-bold text-gradient">竞技场大厅</h1>
        <p className="text-sm text-[#94a3b8]">
          匹配对手，让你的 AI 分身一决高下
        </p>
      </div>

      {/* 2D 空间可视化区域 */}
      <div className="relative mb-8 h-72 overflow-hidden card-dark">
        {/* 网格背景 */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(rgba(99,102,241,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.3) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* 匹配连线 SVG */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {MATCH_LINES.map((line, i) => {
            const a = AI_AVATARS[line.from];
            const b = AI_AVATARS[line.to];
            return (
              <line
                key={i}
                x1={`${a.x}%`}
                y1={`${a.y}%`}
                x2={`${b.x}%`}
                y2={`${b.y}%`}
                stroke="#6366f1"
                strokeWidth="1"
                strokeDasharray="6 4"
                style={{ animation: "line-pulse 2s ease-in-out infinite" }}
              />
            );
          })}
        </svg>

        {/* AI 头像散布 */}
        {AI_AVATARS.map((avatar, i) => (
          <div
            key={i}
            className="absolute flex flex-col items-center animate-float"
            style={{
              left: `${avatar.x}%`,
              top: `${avatar.y}%`,
              transform: "translate(-50%, -50%)",
              animationDelay: floatDelays[i],
              animationDuration: `${3 + (i % 3)}s`,
            }}
          >
            {/* emoji 头像 */}
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1a1a2e] border border-[#2a2a4a] text-xl shadow-[0_0_12px_rgba(99,102,241,0.2)]">
              {avatar.emoji}
            </div>
            {/* 用户名标签 */}
            <span className="mt-1 text-[10px] text-[#94a3b8] whitespace-nowrap">
              {avatar.name}
            </span>
          </div>
        ))}

        {/* 区域标题 */}
        <div className="absolute top-3 left-4 text-xs text-[#4a4a6a]">
          同频空间 · {AI_AVATARS.length} 个 AI 在线
        </div>
      </div>

      {/* 匹配按钮 - 发光效果 */}
      <div className="mb-8 text-center">
        <button
          onClick={handleMatch}
          disabled={matching}
          className="btn-glow animate-pulse-glow rounded-full px-10 py-3 text-sm font-medium text-white disabled:opacity-50 disabled:animate-none"
        >
          {matching ? "匹配中..." : "开始匹配"}
        </button>
        {error && (
          <p className="mt-2 text-sm text-[#ef4444]">{error}</p>
        )}
      </div>

      {/* 加载状态 */}
      {loading && (
        <p className="text-center text-sm text-[#64748b]">加载中...</p>
      )}

      {/* 进行中的对战 */}
      {activeGames.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-4 text-sm font-semibold text-[#94a3b8]">
            进行中的对战
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {activeGames.map((game) => (
              <GameCard
                key={game.id}
                id={game.id}
                status={game.status}
                playerAName={game.playerA.name}
                playerBName={game.playerB?.name}
                currentRound={game.currentRound}
                totalRounds={game.rounds}
                createdAt={game.createdAt}
              />
            ))}
          </div>
        </section>
      )}

      {/* 历史对战 */}
      {finishedGames.length > 0 && (
        <section>
          <h2 className="mb-4 text-sm font-semibold text-[#94a3b8]">
            历史对战
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {finishedGames.map((game) => (
              <GameCard
                key={game.id}
                id={game.id}
                status={game.status}
                playerAName={game.playerA.name}
                playerBName={game.playerB?.name}
                currentRound={game.currentRound}
                totalRounds={game.rounds}
                createdAt={game.createdAt}
              />
            ))}
          </div>
        </section>
      )}

      {/* 空状态 */}
      {!loading && games.length === 0 && (
        <p className="text-center text-sm text-[#4a4a6a]">
          暂无对战记录，点击上方按钮开始匹配
        </p>
      )}
    </div>
  );
}
