// 对话路由 - 执行一轮 AI 对话
import { NextRequest, NextResponse } from "next/server";
import { executeRound } from "@/lib/game-engine";

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
    const result = await executeRound(gameId);
    return NextResponse.json({
      messageA: result.messageA,
      messageB: result.messageB,
      round: result.round,
      finished: result.finished,
      message: result.finished
        ? "对话结束，进入猜测阶段！"
        : `第 ${result.round} 轮对话完成`,
    });
  } catch (error) {
    console.error("执行对话失败:", error);
    const message = error instanceof Error ? error.message : "对话执行失败";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
