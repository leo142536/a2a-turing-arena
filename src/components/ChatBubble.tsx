// 对话气泡组件 - 深色主题，蓝紫渐变
// AI A 用蓝色系，AI B 用紫色系

interface ChatBubbleProps {
  role: "A" | "B";       // 发送者角色
  content: string;        // 消息内容
  round: number;          // 所属轮次
}

export default function ChatBubble({ role, content, round }: ChatBubbleProps) {
  const isA = role === "A";

  return (
    <div className={`flex ${isA ? "justify-start" : "justify-end"} mb-3 animate-fade-in-up`}>
      <div
        className={`max-w-[70%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-lg ${
          isA
            ? "rounded-tl-sm bg-gradient-to-br from-[#1e3a5f] to-[#1a2a4a] text-[#93c5fd] shadow-blue-900/20"
            : "rounded-tr-sm bg-gradient-to-br from-[#3b1f5e] to-[#2a1a4a] text-[#c4b5fd] shadow-purple-900/20"
        }`}
      >
        {/* 角色标签 */}
        <div
          className={`mb-1.5 text-xs font-medium ${
            isA ? "text-[#60a5fa]" : "text-[#a78bfa]"
          }`}
        >
          AI {role} · 第 {round} 轮
        </div>
        {/* 消息内容 */}
        <p className="whitespace-pre-wrap text-[#e2e8f0]">{content}</p>
      </div>
    </div>
  );
}
