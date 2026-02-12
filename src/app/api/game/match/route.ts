// 匹配路由 - GET 获取游戏列表，POST 发起匹配
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { findOrCreateGame } from "@/lib/game-engine";

// 获取当前用户 ID（从 cookie）
function getUserId(request: NextRequest): string | null {
  return request.cookies.get("userId")?.value || null;
}

// GET: 获取游戏列表
export async function GET(request: NextRequest) {
  const userId = getUserId(request);

  try {
    // 获取所有游戏（如果已登录则优先显示自己的）
    const games = await prisma.game.findMany({
      include: {
        playerA: { select: { id: true, name: true } },
        playerB: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
      ...(userId
        ? {
            where: {
              OR: [
                { playerAId: userId },
                { playerBId: userId },
              ],
            },
          }
        : {}),
    });

    return NextResponse.json({ games });
  } catch (error) {
    console.error("获取游戏列表失败:", error);
    return NextResponse.json(
      { error: "获取游戏列表失败" },
      { status: 500 }
    );
  }
}

// POST: 发起匹配
export async function POST(request: NextRequest) {
  const userId = getUserId(request);

  if (!userId) {
    return NextResponse.json(
      { error: "请先登录" },
      { status: 401 }
    );
  }

  try {
    const result = await findOrCreateGame(userId);
    return NextResponse.json({
      gameId: result.gameId,
      matched: result.matched,
      message: result.matched ? "匹配成功！" : "已创建游戏，等待对手加入...",
    });
  } catch (error) {
    console.error("匹配失败:", error);
    return NextResponse.json(
      { error: "匹配失败，请重试" },
      { status: 500 }
    );
  }
}
