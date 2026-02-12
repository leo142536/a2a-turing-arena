// 对话气泡组件 - 深色主题 + framer-motion 滑入动画
// AI A 用蓝色系从左滑入，AI B 用紫色系从右滑入
"use client";

import { motion, useReducedMotion } from "framer-motion";

interface ChatBubbleProps {
  role: "A" | "B"; // 发送者角色
  content: string; // 消息内容
  round: number; // 所属轮次
}

export default function ChatBubble({ role, content, round }: ChatBubbleProps) {
  const isA = role === "A";
  const prefersReduced = useReducedMotion();

  return (
    <motion.div
      className={`flex ${isA ? "justify-start" : "justify-end"} mb-3`}
      initial={
        prefersReduced
          ? false
          : { opacity: 0, x: isA ? -30 : 30 }
      }
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" as const }}
    >
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
    </motion.div>
  );
}
