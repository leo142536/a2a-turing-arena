// 对战详情页 - 深色科技主题 + framer-motion 动画增强
"use client";

import { useState, useEffect, use } from "react";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  useMotionValue,
  animate as fmAnimate,
} from "framer-motion";
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
  WAITING: {
    label: "等待匹配",
    color: "bg-[#f59e0b]/15 text-[#fbbf24] border border-[#f59e0b]/30",
  },
  PLAYING: {
    label: "AI 对话中",
    color: "bg-[#10b981]/15 text-[#34d399] border border-[#10b981]/30",
  },
  GUESSING: {
    label: "猜测阶段",
    color: "bg-[#22d3ee]/15 text-[#22d3ee] border border-[#22d3ee]/30",
  },
  FINISHED: {
    label: "已结束",
    color: "bg-[#94a3b8]/10 text-[#94a3b8] border border-[#94a3b8]/20",
  },
};

// 分数计数动画组件
function ScoreCounter({
  target,
  color,
  delay = 0,
}: {
  target: number;
  color: string;
  delay?: number;
}) {
  const [display, setDisplay] = useState(target);
  const prefersReduced = useReducedMotion();
  const mv = useMotionValue(0);

  useEffect(() => {
    if (prefersReduced) {
      setDisplay(target);
      return;
    }
    const ctrl = fmAnimate(mv, target, {
      duration: 1.2,
      delay,
      ease: "easeOut" as const,
    });
    const unsub = mv.on("change", (v) => setDisplay(Math.round(v)));
    return () => {
      ctrl.stop();
      unsub();
    };
  }, [target, prefersReduced, delay, mv]);

  return (
    <span className={`text-4xl font-bold ${color}`}>
      {display}
    </span>
  );
}

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
  const prefersReduced = useReducedMotion();

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

  async function handleGuess() {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/game/${gameId}/guess`, {
        method: "POST",
      });
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

  // 加载中
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
      <motion.div
        className="mb-6 card-dark p-6"
        initial={prefersReduced ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-center gap-6">
          {/* 玩家 A */}
          <motion.div
            className="text-center"
            initial={prefersReduced ? false : { opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#1e3a5f] to-[#1a2a4a] border border-[#60a5fa]/30 text-2xl shadow-[0_0_15px_rgba(96,165,250,0.2)]">
              {"\u{1F916}"}
            </div>
            <p className="text-sm font-medium text-[#60a5fa]">
              {game.playerA.name}
            </p>
          </motion.div>

          {/* VS 标志 - 缩放弹入 */}
          <motion.div
            className="text-gradient text-2xl font-bold"
            initial={prefersReduced ? false : { opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: 0.4,
              type: "spring" as const,
              stiffness: 300,
              damping: 15,
            }}
          >
            VS
          </motion.div>

          {/* 玩家 B */}
          <motion.div
            className="text-center"
            initial={prefersReduced ? false : { opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#3b1f5e] to-[#2a1a4a] border border-[#a78bfa]/30 text-2xl shadow-[0_0_15px_rgba(167,139,250,0.2)]">
              {"\u{1F9E0}"}
            </div>
            <p className="text-sm font-medium text-[#a78bfa]">
              {game.playerB?.name || "等待中"}
            </p>
          </motion.div>
        </div>

        {/* 状态标签 + 轮次 */}
        <div className="mt-4 flex items-center justify-center gap-3">
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${statusInfo.color}`}
          >
            {statusInfo.label}
          </span>
          <span className="text-xs text-[#64748b]">
            第 {game.currentRound}/{game.rounds} 轮
          </span>
        </div>
      </motion.div>

      {/* 进度条 - 平滑过渡 */}
      <div className="mb-6">
        <div className="h-1.5 rounded-full bg-[#1a1a2e]">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] shadow-[0_0_8px_rgba(99,102,241,0.4)]"
            initial={{ width: 0 }}
            animate={{
              width: `${(game.currentRound / game.rounds) * 100}%`,
            }}
            transition={{ duration: 0.8, ease: "easeOut" as const }}
          />
        </div>
      </div>

      {/* 对话区域 - 消息 slide-in 动画 */}
      <div className="mb-6 card-dark p-4">
        <h2 className="mb-4 text-sm font-semibold text-[#94a3b8]">
          AI 对话记录
        </h2>
        {game.messages.length === 0 ? (
          <p className="py-8 text-center text-sm text-[#4a4a6a]">
            对话尚未开始
          </p>
        ) : (
          <div className="space-y-1">
            <AnimatePresence>
              {game.messages.map((msg, i) => (
                <motion.div
                  key={msg.id}
                  initial={
                    prefersReduced
                      ? false
                      : {
                          opacity: 0,
                          x: msg.senderRole === "A" ? -40 : 40,
                        }
                  }
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: i * 0.06,
                    duration: 0.4,
                    ease: "easeOut" as const,
                  }}
                >
                  <ChatBubble
                    role={msg.senderRole}
                    content={msg.content}
                    round={msg.round}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* 操作按钮 */}
      {error && (
        <p className="mb-4 text-center text-sm text-[#ef4444]">{error}</p>
      )}

      <div className="mb-6 flex justify-center gap-3">
        {game.status === "PLAYING" && (
          <motion.button
            onClick={handleNextRound}
            disabled={actionLoading}
            className="btn-glow rounded-full px-6 py-2.5 text-sm font-medium text-white disabled:opacity-50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {actionLoading
              ? "对话中..."
              : `执行第 ${game.currentRound + 1} 轮对话`}
          </motion.button>
        )}
        {game.status === "GUESSING" && (
          <motion.button
            onClick={handleGuess}
            disabled={actionLoading}
            className="btn-glow rounded-full px-6 py-2.5 text-sm font-medium text-white disabled:opacity-50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {actionLoading ? "猜测中..." : "让 AI 提交猜测"}
          </motion.button>
        )}
      </div>

      {/* 猜测结果 - 翻转动画 */}
      {game.guesses.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-[#94a3b8]">猜测结果</h2>
          <AnimatePresence>
            {game.guesses.map((guess, i) => (
              <motion.div
                key={i}
                initial={
                  prefersReduced
                    ? false
                    : { opacity: 0, rotateX: -90 }
                }
                animate={{ opacity: 1, rotateX: 0 }}
                transition={{
                  delay: i * 0.2,
                  duration: 0.5,
                  ease: "easeOut" as const,
                }}
                style={{ perspective: 600 }}
              >
                <ProfileGuess
                  guesserName={guess.guesserName}
                  targetName={guess.targetName}
                  guess={guess}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* 最终得分 - 计数动画 */}
      {game.status === "FINISHED" && game.scoreA != null && (
        <motion.div
          className="mt-6 card-dark p-6 text-center overflow-hidden relative"
          initial={prefersReduced ? false : { opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" as const }}
        >
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 h-20 w-20 rounded-full bg-[#6366f1]/10 blur-[40px]" />
            <div className="absolute bottom-0 right-1/4 h-20 w-20 rounded-full bg-[#8b5cf6]/10 blur-[40px]" />
          </div>

          <h2 className="relative mb-4 text-sm font-semibold text-[#94a3b8]">
            最终得分
          </h2>
          <div className="relative flex items-center justify-center gap-8">
            <motion.div
              initial={prefersReduced ? false : { scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                delay: 0.3,
                type: "spring" as const,
                stiffness: 200,
              }}
            >
              <ScoreCounter
                target={game.scoreA ?? 0}
                color="text-[#60a5fa]"
                delay={0.5}
              />
              <p className="mt-1 text-xs text-[#64748b]">
                {game.playerA.name}
              </p>
            </motion.div>
            <span className="text-2xl text-[#2a2a4a]">:</span>
            <motion.div
              initial={prefersReduced ? false : { scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                delay: 0.5,
                type: "spring" as const,
                stiffness: 200,
              }}
            >
              <ScoreCounter
                target={game.scoreB ?? 0}
                color="text-[#a78bfa]"
                delay={0.7}
              />
              <p className="mt-1 text-xs text-[#64748b]">
                {game.playerB?.name}
              </p>
            </motion.div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
