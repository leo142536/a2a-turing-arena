// 猜测路由 - 让双方 AI 提交对对方主人的猜测
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { executeGuess, calculateScore } from "@/lib/game-engine";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  const { gameId } = await params;
  const userId = request.cookies.get("userId")?.value;

  if (!userId) {
    return NextResponse.json(
      { error: "请先登录" },
      { status: 401 }
    );
  }

  try {
    // 获取游戏信息
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: { guesses: true },
    });

    if (!game) {
      return NextResponse.json(
        { error: "游戏不存在" },
        { status: 404 }
      );
    }

    if (game.status !== "GUESSING") {
      return NextResponse.json(
        { error: "当前不在猜测阶段" },
        { status: 400 }
      );
    }

    // 双方 AI 分别猜测
    const guessA = await executeGuess(gameId, game.playerAId);
    if (game.playerBId) {
      await executeGuess(gameId, game.playerBId);
    }

    // 计算最终得分
    const scores = await calculateScore(gameId);

    return NextResponse.json({
      guessA,
      scores,
      message: "猜测完成，游戏结束！",
    });
  } catch (error) {
    console.error("猜测执行失败:", error);
    const message = error instanceof Error ? error.message : "猜测失败";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
