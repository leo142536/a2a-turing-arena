// 文字逐字出现效果 - framer-motion 实现逐词淡入
"use client";

import { useEffect } from "react";
import { motion, stagger, useAnimate, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TextGenerateEffectProps {
  words: string;
  className?: string;
  /** 每个词的动画延迟间隔（秒） */
  staggerDelay?: number;
}

export function TextGenerateEffect({
  words,
  className,
  staggerDelay = 0.08,
}: TextGenerateEffectProps) {
  const [scope, animate] = useAnimate();
  const prefersReducedMotion = useReducedMotion();
  const wordArray = words.split(" ");

  useEffect(() => {
    if (prefersReducedMotion) {
      // 无障碍：直接显示全部文字
      animate("span", { opacity: 1, filter: "blur(0px)" }, { duration: 0 });
      return;
    }
    animate(
      "span",
      { opacity: 1, filter: "blur(0px)" },
      { duration: 0.4, delay: stagger(staggerDelay) }
    );
  }, [animate, prefersReducedMotion, staggerDelay]);

  return (
    <div ref={scope} className={cn("inline", className)}>
      {wordArray.map((word, idx) => (
        <motion.span
          key={`${word}-${idx}`}
          className="inline-block opacity-0"
          style={{ filter: "blur(6px)" }}
        >
          {word}
          {idx < wordArray.length - 1 && "\u00A0"}
        </motion.span>
      ))}
    </div>
  );
}
