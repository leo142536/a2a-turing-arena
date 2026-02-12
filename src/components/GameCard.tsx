// 游戏卡片组件 - 深色卡片，边框发光，彩色状态标签
import Link from "next/link";

// 游戏状态中文映射 - 深色主题配色
const statusMap: Record<string, { label: string; color: string }> = {
  WAITING: { label: "等待匹配", color: "bg-[#f59e0b]/15 text-[#fbbf24] border border-[#f59e0b]/30" },
  PLAYING: { label: "对话中", color: "bg-[#10b981]/15 text-[#34d399] border border-[#10b981]/30" },
  GUESSING: { label: "猜测中", color: "bg-[#22d3ee]/15 text-[#22d3ee] border border-[#22d3ee]/30" },
  FINISHED: { label: "已结束", color: "bg-[#94a3b8]/10 text-[#94a3b8] border border-[#94a3b8]/20" },
};

interface GameCardProps {
  id: string;
  status: string;
  playerAName: string;
  playerBName?: string;
  currentRound: number;
  totalRounds: number;
  createdAt: string;
}

export default function GameCard({
  id,
  status,
  playerAName,
  playerBName,
  currentRound,
  totalRounds,
  createdAt,
}: GameCardProps) {
  const statusInfo = statusMap[status] || statusMap.WAITING;

  return (
    <Link
      href={`/arena/${id}`}
      className="card-glow block p-4 transition-all hover:translate-y-[-2px]"
    >
      {/* 顶部：状态标签 + 时间 */}
      <div className="mb-3 flex items-center justify-between">
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusInfo.color}`}>
          {statusInfo.label}
        </span>
        <span className="text-xs text-[#64748b]">
          {new Date(createdAt).toLocaleString("zh-CN")}
        </span>
      </div>

      {/* 对战双方 */}
      <div className="flex items-center justify-center gap-3 text-sm">
        <span className="font-medium text-[#818cf8]">{playerAName}</span>
        <span className="text-[#4a4a6a] text-xs">VS</span>
        <span className="font-medium text-[#a78bfa]">
          {playerBName || "等待中..."}
        </span>
      </div>

      {/* 进度条 */}
      {status !== "WAITING" && (
        <div className="mt-3">
          <div className="mb-1 flex justify-between text-xs text-[#64748b]">
            <span>对话进度</span>
            <span>{currentRound}/{totalRounds} 轮</span>
          </div>
          <div className="h-1.5 rounded-full bg-[#0a0a1a]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] transition-all shadow-[0_0_6px_rgba(99,102,241,0.4)]"
              style={{ width: `${(currentRound / totalRounds) * 100}%` }}
            />
          </div>
        </div>
      )}
    </Link>
  );
}
