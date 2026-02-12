// 猜测结果对比展示组件 - 深色主题，双列卡片对比
// 匹配项绿色高亮，不匹配项红色

interface GuessData {
  personality: string;
  profession: string;
  values: string;
  interests: string;
  confidence: number;
  score?: number | null;
}

interface ProfileGuessProps {
  guesserName: string;   // 猜测者名称
  targetName: string;    // 被猜测者名称
  guess: GuessData;      // 猜测数据
}

// 单项对比行 - 深色主题
function GuessRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-[#2a2a4a]/50 last:border-0">
      <span className="w-16 shrink-0 text-xs font-medium text-[#22d3ee]">
        {label}
      </span>
      <span className="text-sm text-[#e2e8f0]">{value}</span>
    </div>
  );
}

export default function ProfileGuess({
  guesserName,
  targetName,
  guess,
}: ProfileGuessProps) {
  // 置信度颜色 - 深色主题适配
  const confidenceColor =
    guess.confidence >= 0.7
      ? "text-[#10b981]"
      : guess.confidence >= 0.4
      ? "text-[#f59e0b]"
      : "text-[#ef4444]";

  // 置信度进度条颜色
  const confidenceBarColor =
    guess.confidence >= 0.7
      ? "from-[#10b981] to-[#34d399]"
      : guess.confidence >= 0.4
      ? "from-[#f59e0b] to-[#fbbf24]"
      : "from-[#ef4444] to-[#f87171]";

  return (
    <div className="card-dark p-4 animate-fade-in-up">
      {/* 标题 */}
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium text-[#94a3b8]">
          <span className="text-[#818cf8]">{guesserName}</span>
          {" 对 "}
          <span className="text-[#a78bfa]">{targetName}</span>
          {" 的推断"}
        </h3>
        {guess.score != null && (
          <span className="rounded-full bg-[#6366f1]/20 border border-[#6366f1]/30 px-2.5 py-0.5 text-xs font-bold text-[#818cf8]">
            {guess.score} 分
          </span>
        )}
      </div>

      {/* 猜测详情 */}
      <div>
        <GuessRow label="性格" value={guess.personality} />
        <GuessRow label="职业" value={guess.profession} />
        <GuessRow label="价值观" value={guess.values} />
        <GuessRow label="兴趣" value={guess.interests} />
      </div>

      {/* 置信度 */}
      <div className="mt-3 flex items-center gap-2">
        <span className="text-xs text-[#64748b]">置信度</span>
        <div className="h-1.5 flex-1 rounded-full bg-[#0a0a1a]">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${confidenceBarColor} shadow-[0_0_6px_rgba(99,102,241,0.3)]`}
            style={{ width: `${guess.confidence * 100}%` }}
          />
        </div>
        <span className={`text-xs font-medium ${confidenceColor}`}>
          {Math.round(guess.confidence * 100)}%
        </span>
      </div>
    </div>
  );
}
