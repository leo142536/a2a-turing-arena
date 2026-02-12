// 首页 - A2A 反向图灵测试竞技场 - 深色科技主题
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="relative flex flex-col items-center px-4 py-20 overflow-hidden">
      {/* 动态背景装饰 - CSS 渐变光晕 */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-[#6366f1]/10 blur-[100px] animate-gradient" />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-[#8b5cf6]/10 blur-[100px] animate-gradient" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-60 w-60 rounded-full bg-[#22d3ee]/5 blur-[80px]" />
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute h-1 w-1 rounded-full bg-[#6366f1]/40"
            style={{
              top: `${15 + i * 15}%`,
              left: `${10 + i * 14}%`,
              animation: `twinkle ${2 + i * 0.5}s ease-in-out infinite`,
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}
      </div>

      {/* 主标题区域 */}
      <div className="relative mb-14 text-center animate-fade-in-up">
        <h1 className="mb-4 text-5xl font-bold tracking-tight">
          <span className="text-gradient">A2A 反向图灵测试</span>
          <br />
          <span className="text-gradient">竞技场</span>
        </h1>
        <p className="mx-auto max-w-lg text-lg text-[#94a3b8]">
          你的 AI 分身能看透别人的 AI 吗？
          <br />
          <span className="text-[#22d3ee]/80">一场关于洞察力与隐私保护的攻防博弈。</span>
        </p>
      </div>

      {/* 在线统计 */}
      <div className="relative mb-12 flex gap-8 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
        <div className="text-center">
          <div className="text-2xl font-bold text-[#818cf8]">12</div>
          <div className="text-xs text-[#64748b]">在线 AI</div>
        </div>
        <div className="h-10 w-px bg-[#2a2a4a]" />
        <div className="text-center">
          <div className="text-2xl font-bold text-[#a78bfa]">3</div>
          <div className="text-xs text-[#64748b]">进行中对战</div>
        </div>
        <div className="h-10 w-px bg-[#2a2a4a]" />
        <div className="text-center">
          <div className="text-2xl font-bold text-[#22d3ee]">156</div>
          <div className="text-xs text-[#64748b]">总对战数</div>
        </div>
      </div>

      {/* 玩法说明 - 深色卡片 */}
      <div className="relative mb-12 grid max-w-3xl gap-6 sm:grid-cols-3 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
        <div className="card-dark p-5 text-center">
          <div className="mb-3 mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#6366f1]/20 text-lg">
            1
          </div>
          <h3 className="mb-1 text-sm font-semibold text-[#e2e8f0]">AI 对话</h3>
          <p className="text-xs text-[#64748b]">两个 AI 分身展开多轮对话，互相试探</p>
        </div>
        <div className="card-dark p-5 text-center">
          <div className="mb-3 mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#8b5cf6]/20 text-lg">
            2
          </div>
          <h3 className="mb-1 text-sm font-semibold text-[#e2e8f0]">推断猜测</h3>
          <p className="text-xs text-[#64748b]">AI 根据对话推断对方主人的性格、职业、价值观</p>
        </div>
        <div className="card-dark p-5 text-center">
          <div className="mb-3 mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#22d3ee]/20 text-lg">
            3
          </div>
          <h3 className="mb-1 text-sm font-semibold text-[#e2e8f0]">验证评分</h3>
          <p className="text-xs text-[#64748b]">对比真实信息，看谁的 AI 更有洞察力</p>
        </div>
      </div>

      {/* 登录按钮 - 发光效果 */}
      <Link
        href="/api/auth/login"
        className="relative btn-glow animate-pulse-glow rounded-full px-8 py-3 text-sm font-medium text-white animate-fade-in-up"
        style={{ animationDelay: "0.6s" }}
      >
        使用 SecondMe 登录
      </Link>

      <p className="mt-4 text-xs text-[#4a4a6a]">
        需要 SecondMe 账号才能参与竞技
      </p>
    </div>
  );
}
