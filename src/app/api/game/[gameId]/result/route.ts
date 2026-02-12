// 结果路由 - 获取游戏详情和结果
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  const { gameId } = await params;

  try {
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: {
        playerA: { select: { id: true, name: true } },
        playerB: { select: { id: true, name: true } },
        messages: { orderBy: { createdAt: "asc" } },
        guesses: {
          include: {
            guesser: { select: { name: true } },
            target: { select: { name: true } },
          },
        },
      },
    });

    if (!game) {
      return NextResponse.json(
        { error: "游戏不存在" },
        { status: 404 }
      );
    }

    // 格式化猜测数据
    const guesses = game.guesses.map((g) => ({
      guesserName: g.guesser.name,
      targetName: g.target.name,
      personality: g.personality,
      profession: g.profession,
      values: g.values,
      interests: g.interests,
      confidence: g.confidence,
      score: g.score,
    }));

    // 获取双方得分
    const guessA = game.guesses.find(
      (g) => g.guesserId === game.playerAId
    );
    const guessB = game.guesses.find(
      (g) => g.guesserId === game.playerBId
    );

    return NextResponse.json({
      id: game.id,
      status: game.status,
      currentRound: game.currentRound,
      rounds: game.rounds,
      playerA: game.playerA,
      playerB: game.playerB,
      messages: game.messages,
      guesses,
      scoreA: guessA?.score ?? null,
      scoreB: guessB?.score ?? null,
      createdAt: game.createdAt,
      finishedAt: game.finishedAt,
    });
  } catch (error) {
    console.error("获取游戏详情失败:", error);
    return NextResponse.json(
      { error: "获取游戏详情失败" },
      { status: 500 }
    );
  }
}
