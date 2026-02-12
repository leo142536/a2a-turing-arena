// 对战详情页 - 深色科技主题，VS 对决布局，蓝紫双色对话
"use client";

import { useState, useEffect, use } from "react";
import ChatBubble from "@/components/ChatBubble";
import ProfileGuess from "@/components/ProfileGuess";

// 消息类型
interface Message {
  id: string;
  senderRole: "A" | "B";
  content: string;
  round: number;
}

// 猜测类型
interface GuessData {
  guesserName: string;
  targetName: string;
  personality: string;
  profession: string;
  values: string;
  interests: string;
  confidence: number;
  score?: number | null;
}

// 游戏详情类型
interface GameDetail {
  id: string;
  status: string;
  currentRound: number;
  rounds: number;
  playerA: { id: string; name: string };
  playerB?: { id: string; name: string };
  messages: Message[];
  guesses: GuessData[];
  scoreA?: number;
  scoreB?: number;
}

// 状态配色
const statusConfig: Record<string, { label: string; color: string }> = {
  WAITING: { label: "等待匹配", color: "bg-[#f59e0b]/15 text-[#fbbf24] border border-[#f59e0b]/30" },
  PLAYING: { label: "AI 对话中", color: "bg-[#10b981]/15 text-[#34d399] border border-[#10b981]/30" },
  GUESSING: { label: "猜测阶段", color: "bg-[#22d3ee]/15 text-[#22d3ee] border border-[#22d3ee]/30" },
  FINISHED: { label: "已结束", color: "bg-[#94a3b8]/10 text-[#94a3b8] border border-[#94a3b8]/20" },
};

export default function GameDetailPage({
  params,
}: {
  params: Promise<{ gameId: string }>;
}) {
  const { gameId } = use(params);
  const [game, setGame] = useState<GameDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  // 加载游戏详情
  useEffect(() => {
    fetchGame();
  }, [gameId]);

  async function fetchGame() {
    try {
      const res = await fetch(`/api/game/${gameId}/result`);
      if (res.ok) {
        const data = await res.json();
        setGame(data);
      } else {
        setError("加载游戏详情失败");
      }
    } catch {
      setError("网络错误");
    } finally {
      setLoading(false);
    }
  }

  // 执行下一轮对话
  async function handleNextRound() {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/game/${gameId}/chat`, { method: "POST" });
      if (res.ok) {
        await fetchGame();
      } else {
        const data = await res.json();
        setError(data.error || "对话执行失败");
      }
    } catch {
      setError("网络错误");
    } finally {
      setActionLoading(false);
    }
  }

  // 执行猜测
  async function handleGuess() {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/game/${gameId}/guess`, { method: "POST" });
      if (res.ok) {
        await fetchGame();
      } else {
        const data = await res.json();
        setError(data.error || "猜测执行失败");
      }
    } catch {
      setError("网络错误");
    } finally {
      setActionLoading(false);
    }
  }

  // 加载中状态
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="mb-3 h-8 w-8 mx-auto rounded-full border-2 border-[#6366f1] border-t-transparent animate-spin" />
          <p className="text-sm text-[#64748b]">加载中...</p>
        </div>
      </div>
    );
  }

  // 错误状态
  if (!game) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-[#ef4444]">{error || "游戏不存在"}</p>
      </div>
    );
  }

  const statusInfo = statusConfig[game.status] || statusConfig.WAITING;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      {/* 顶部：VS 对决头像区域 */}
      <div className="mb-6 card-dark p-6">
        <div className="flex items-center justify-center gap-6">
          {/* 玩家 A */}
          <div className="text-center animate-fade-in-up">
            <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#1e3a5f] to-[#1a2a4a] border border-[#60a5fa]/30 text-2xl shadow-[0_0_15px_rgba(96,165,250,0.2)]">
              🤖
            </div>
            <p className="text-sm font-medium text-[#60a5fa]">{game.playerA.name}</p>
          </div>

          {/* VS 标志 */}
          <div className="text-gradient text-2xl font-bold animate-scale-in">VS</div>

          {/* 玩家 B */}
          <div className="text-center animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#3b1f5e] to-[#2a1a4a] border border-[#a78bfa]/30 text-2xl shadow-[0_0_15px_rgba(167,139,250,0.2)]">
              🧠
            </div>
            <p className="text-sm font-medium text-[#a78bfa]">{game.playerB?.name || "等待中"}</p>
          </div>
        </div>

        {/* 状态标签 + 轮次 */}
        <div className="mt-4 flex items-center justify-center gap-3">
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
          <span className="text-xs text-[#64748b]">
            第 {game.currentRound}/{game.rounds} 轮
          </span>
        </div>
      </div>

      {/* 进度条 */}
      <div className="mb-6">
        <div className="h-1.5 rounded-full bg-[#1a1a2e]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] transition-all shadow-[0_0_8px_rgba(99,102,241,0.4)]"
            style={{ width: `${(game.currentRound / game.rounds) * 100}%` }}
          />
        </div>
      </div>

      {/* 对话区域 */}
      <div className="mb-6 card-dark p-4">
        <h2 className="mb-4 text-sm font-semibold text-[#94a3b8]">AI 对话记录</h2>
        {game.messages.length === 0 ? (
          <p className="py-8 text-center text-sm text-[#4a4a6a]">
            对话尚未开始
          </p>
        ) : (
          <div className="space-y-1">
            {game.messages.map((msg) => (
              <ChatBubble
                key={msg.id}
                role={msg.senderRole}
                content={msg.content}
                round={msg.round}
              />
            ))}
          </div>
        )}
      </div>

      {/* 操作按钮 */}
      {error && <p className="mb-4 text-center text-sm text-[#ef4444]">{error}</p>}

      <div className="mb-6 flex justify-center gap-3">
        {game.status === "PLAYING" && (
          <button
            onClick={handleNextRound}
            disabled={actionLoading}
            className="btn-glow rounded-full px-6 py-2.5 text-sm font-medium text-white disabled:opacity-50"
          >
            {actionLoading ? "对话中..." : `执行第 ${game.currentRound + 1} 轮对话`}
          </button>
        )}
        {game.status === "GUESSING" && (
          <button
            onClick={handleGuess}
            disabled={actionLoading}
            className="btn-glow rounded-full px-6 py-2.5 text-sm font-medium text-white disabled:opacity-50"
          >
            {actionLoading ? "猜测中..." : "让 AI 提交猜测"}
          </button>
        )}
      </div>

      {/* 猜测结果 */}
      {game.guesses.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-[#94a3b8]">猜测结果</h2>
          {game.guesses.map((guess, i) => (
            <ProfileGuess
              key={i}
              guesserName={guess.guesserName}
              targetName={guess.targetName}
              guess={guess}
            />
          ))}
        </div>
      )}

      {/* 最终得分 - 大数字动画展示 */}
      {game.status === "FINISHED" && game.scoreA != null && (
        <div className="mt-6 card-dark p-6 text-center overflow-hidden relative">
          {/* 背景光晕 */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 h-20 w-20 rounded-full bg-[#6366f1]/10 blur-[40px]" />
            <div className="absolute bottom-0 right-1/4 h-20 w-20 rounded-full bg-[#8b5cf6]/10 blur-[40px]" />
          </div>

          <h2 className="relative mb-4 text-sm font-semibold text-[#94a3b8]">最终得分</h2>
          <div className="relative flex items-center justify-center gap-8">
            <div className="animate-scale-in">
              <p className="text-4xl font-bold text-[#60a5fa]">{game.scoreA}</p>
              <p className="mt-1 text-xs text-[#64748b]">{game.playerA.name}</p>
            </div>
            <span className="text-2xl text-[#2a2a4a]">:</span>
            <div className="animate-scale-in" style={{ animationDelay: "0.2s" }}>
              <p className="text-4xl font-bold text-[#a78bfa]">{game.scoreB}</p>
              <p className="mt-1 text-xs text-[#64748b]">{game.playerB?.name}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
