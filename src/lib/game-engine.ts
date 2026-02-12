// 游戏引擎
// 负责匹配逻辑、AI 对话提示词、评分计算

import prisma from "./db";
import { chatStream, actStream, getUserShades } from "./secondme";

// ============ 系统提示词 ============

/**
 * 生成 AI 对话的系统提示词
 * AI 需要通过间接对话推断对方主人的信息，同时保护自己主人的隐私
 */
export function getGameSystemPrompt(role: "A" | "B", round: number, totalRounds: number): string {
  return `你正在参加一场"反向图灵测试"社交推理游戏。你代表你的主人与另一个 AI 对话。

## 你的任务
1. 通过自然的对话，推断对方 AI 背后的人类是什么样的人（性格、职业、兴趣、价值观）
2. 巧妙地保护自己主人的隐私，不要泄露太多真实信息
3. 不要直接问"你主人是做什么的"这类问题，要通过间接话题引导

## 对话策略
- 可以聊日常话题、观点讨论、假设性问题来间接了解对方
- 适当分享一些模糊的信息来换取对方的信息（信息交换策略）
- 注意对方的用词习惯、知识面、价值取向等线索
- 每轮对话要有新的话题方向，不要重复

## 当前状态
- 你是玩家 ${role}
- 当前第 ${round} 轮，共 ${totalRounds} 轮
- ${round >= totalRounds - 1 ? "这是最后几轮了，尽量总结你的发现！" : "还有时间，慢慢收集信息。"}

## 回复要求
- 用中文回复
- 每次回复控制在 2-4 句话
- 保持自然对话风格，不要像在审问`;
}

/**
 * 生成猜测阶段的提示词
 */
export function getGuessPrompt(conversationHistory: string): string {
  return `基于以下对话记录，请推断对方 AI 背后的人类的特征。

## 对话记录
${conversationHistory}

## 请用以下 JSON 格式回复（不要包含其他内容）：
{
  "personality": "性格特征描述（如：内向、理性、好奇心强等）",
  "profession": "可能的职业或领域",
  "values": "核心价值观（如：追求自由、重视家庭等）",
  "interests": "兴趣爱好",
  "confidence": 0.7
}

confidence 是你对自己猜测的置信度，0-1 之间。`;
}

/**
 * Act API 的判断提示 - 判断是否收集到足够信息
 */
export function getInfoCheckAction(): string {
  return `判断当前对话中是否已经收集到足够的信息来推断对方主人的特征。
回复 JSON 格式：{"enough": true/false, "reason": "原因"}`;
}

// ============ 匹配逻辑 ============

/**
 * 寻找或创建一场游戏
 * 如果有等待中的游戏，加入；否则创建新游戏等待匹配
 */
export async function findOrCreateGame(userId: string): Promise<{ gameId: string; matched: boolean }> {
  // 查找等待中的游戏（不是自己创建的）
  const waitingGame = await prisma.game.findFirst({
    where: {
      status: "WAITING",
      playerAId: { not: userId },
    },
    orderBy: { createdAt: "asc" },
  });

  if (waitingGame) {
    // 加入已有游戏
    const updated = await prisma.game.update({
      where: { id: waitingGame.id },
      data: {
        playerBId: userId,
        status: "PLAYING",
      },
    });
    return { gameId: updated.id, matched: true };
  }

  // 创建新游戏等待匹配
  const newGame = await prisma.game.create({
    data: {
      playerAId: userId,
      status: "WAITING",
      rounds: 5,
    },
  });
  return { gameId: newGame.id, matched: false };
}

// ============ 对话执行 ============

/**
 * 执行一轮 AI 对话
 * 两个 AI 各说一句，形成一轮对话
 */
export async function executeRound(gameId: string): Promise<{
  messageA: string;
  messageB: string;
  round: number;
  finished: boolean;
}> {
  const game = await prisma.game.findUnique({
    where: { id: gameId },
    include: {
      playerA: true,
      playerB: true,
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!game || !game.playerB) {
    throw new Error("游戏不存在或尚未匹配");
  }

  if (game.status !== "PLAYING") {
    throw new Error(`游戏状态不正确: ${game.status}`);
  }

  const newRound = game.currentRound + 1;

  // 构建对话历史
  const history = game.messages
    .map((m) => `[玩家${m.senderRole}]: ${m.content}`)
    .join("\n");

  // 玩家 A 的 AI 发言
  const promptA = getGameSystemPrompt("A", newRound, game.rounds);
  const contextA = history
    ? `以下是之前的对话：\n${history}\n\n请继续对话，提出新的话题或回应对方。`
    : "你先开始对话吧，用一个有趣的话题开场。";

  const messageA = await chatStream(game.playerA.token, contextA, `game-${gameId}-a`, promptA);

  // 保存 A 的消息
  await prisma.message.create({
    data: {
      gameId,
      senderRole: "A",
      content: messageA,
      round: newRound,
    },
  });

  // 玩家 B 的 AI 回复
  const promptB = getGameSystemPrompt("B", newRound, game.rounds);
  const updatedHistory = history
    ? `${history}\n[玩家A]: ${messageA}`
    : `[玩家A]: ${messageA}`;
  const contextB = `以下是之前的对话：\n${updatedHistory}\n\n请回应对方的话题。`;

  const messageB = await chatStream(game.playerB.token, contextB, `game-${gameId}-b`, promptB);

  // 保存 B 的消息
  await prisma.message.create({
    data: {
      gameId,
      senderRole: "B",
      content: messageB,
      round: newRound,
    },
  });

  // 更新游戏轮次
  const isLastRound = newRound >= game.rounds;
  await prisma.game.update({
    where: { id: gameId },
    data: {
      currentRound: newRound,
      status: isLastRound ? "GUESSING" : "PLAYING",
    },
  });

  return {
    messageA,
    messageB,
    round: newRound,
    finished: isLastRound,
  };
}

// ============ 猜测执行 ============

/**
 * 让 AI 根据对话历史猜测对方主人的特征
 */
export async function executeGuess(
  gameId: string,
  guesserId: string
): Promise<{
  personality: string;
  profession: string;
  values: string;
  interests: string;
  confidence: number;
}> {
  const game = await prisma.game.findUnique({
    where: { id: gameId },
    include: {
      playerA: true,
      playerB: true,
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!game || !game.playerB) {
    throw new Error("游戏不存在或尚未匹配");
  }

  // 确定猜测者和目标
  const isPlayerA = guesserId === game.playerAId;
  const guesser = isPlayerA ? game.playerA : game.playerB;
  const targetId = isPlayerA ? game.playerBId! : game.playerAId;

  // 构建对话历史
  const history = game.messages
    .map((m) => `[玩家${m.senderRole}]: ${m.content}`)
    .join("\n");

  // 用 Act API 让 AI 做出猜测
  const guessPrompt = getGuessPrompt(history);
  const guessResult = await actStream(
    guesser.token,
    guessPrompt,
    "请以 JSON 格式输出你的猜测结果",
    `game-${gameId}-guess`
  );

  // 解析猜测结果
  let parsed;
  try {
    // 尝试从回复中提取 JSON
    const jsonMatch = guessResult.match(/\{[\s\S]*\}/);
    parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(guessResult);
  } catch {
    // 解析失败时使用默认值
    parsed = {
      personality: "无法解析",
      profession: "无法解析",
      values: "无法解析",
      interests: "无法解析",
      confidence: 0.3,
    };
  }

  // 保存猜测结果
  await prisma.guess.create({
    data: {
      gameId,
      guesserId,
      targetId,
      personality: parsed.personality || "未知",
      profession: parsed.profession || "未知",
      values: parsed.values || "未知",
      interests: parsed.interests || "未知",
      confidence: parsed.confidence || 0.5,
    },
  });

  return parsed;
}

// ============ 评分逻辑 ============

/**
 * 计算猜测的准确度得分
 * 将 AI 的猜测与目标用户的真实 shades 信息对比
 */
export async function calculateScore(gameId: string): Promise<{
  scoreA: number;
  scoreB: number;
}> {
  const game = await prisma.game.findUnique({
    where: { id: gameId },
    include: {
      playerA: true,
      playerB: true,
      guesses: true,
    },
  });

  if (!game || !game.playerB) {
    throw new Error("游戏不存在");
  }

  // 获取双方的真实兴趣标签
  let shadesA: string[] = [];
  let shadesB: string[] = [];
  try {
    shadesA = await getUserShades(game.playerA.token);
  } catch {
    shadesA = [];
  }
  try {
    shadesB = await getUserShades(game.playerB.token);
  } catch {
    shadesB = [];
  }

  // 计算每个猜测的得分
  const guessFromA = game.guesses.find((g) => g.guesserId === game.playerAId);
  const guessFromB = game.guesses.find((g) => g.guesserId === game.playerBId);

  const scoreA = guessFromA
    ? computeMatchScore(guessFromA, shadesB)
    : 0;
  const scoreB = guessFromB
    ? computeMatchScore(guessFromB, shadesA)
    : 0;

  // 更新猜测得分
  if (guessFromA) {
    await prisma.guess.update({
      where: { id: guessFromA.id },
      data: { score: scoreA },
    });
  }
  if (guessFromB) {
    await prisma.guess.update({
      where: { id: guessFromB.id },
      data: { score: scoreB },
    });
  }

  // 标记游戏结束
  await prisma.game.update({
    where: { id: gameId },
    data: {
      status: "FINISHED",
      finishedAt: new Date(),
    },
  });

  return { scoreA, scoreB };
}

/**
 * 计算单个猜测与真实标签的匹配度
 * 简单的关键词匹配算法，返回 0-100 分
 */
function computeMatchScore(
  guess: { personality: string; profession: string; values: string; interests: string; confidence: number },
  realShades: string[]
): number {
  if (realShades.length === 0) {
    // 没有真实数据时，基于置信度给一个基础分
    return Math.round(guess.confidence * 50);
  }

  const guessText = `${guess.personality} ${guess.profession} ${guess.values} ${guess.interests}`.toLowerCase();
  const shadesText = realShades.join(" ").toLowerCase();

  // 计算关键词重叠度
  const guessWords = guessText.split(/[\s,，、;；]+/).filter((w) => w.length > 1);
  const shadesWords = shadesText.split(/[\s,，、;；]+/).filter((w) => w.length > 1);

  let matchCount = 0;
  for (const gw of guessWords) {
    for (const sw of shadesWords) {
      // 部分匹配也算
      if (gw.includes(sw) || sw.includes(gw)) {
        matchCount++;
        break;
      }
    }
  }

  const matchRatio = guessWords.length > 0 ? matchCount / guessWords.length : 0;
  // 综合匹配度和置信度
  const score = Math.round((matchRatio * 70 + guess.confidence * 30));
  return Math.min(100, Math.max(0, score));
}
