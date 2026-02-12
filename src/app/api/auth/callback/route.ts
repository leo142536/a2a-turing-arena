// OAuth 回调路由 - 处理 SecondMe 授权回调
import { NextRequest, NextResponse } from "next/server";
import { exchangeToken, getUserInfo } from "@/lib/secondme";
import prisma from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json(
      { error: "缺少授权码" },
      { status: 400 }
    );
  }

  const appId = process.env.SECONDME_APP_ID!;
  const appSecret = process.env.SECONDME_APP_SECRET!;
  const redirectUri = process.env.SECONDME_REDIRECT_URI!;

  try {
    // 用授权码换取 token
    const tokens = await exchangeToken(code, appId, appSecret, redirectUri);

    // 获取用户信息
    const userInfo = await getUserInfo(tokens.accessToken);

    // 创建或更新用户记录
    const user = await prisma.user.upsert({
      where: { secondmeId: userInfo.id },
      update: {
        name: userInfo.name,
        avatar: userInfo.avatar,
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
      create: {
        secondmeId: userInfo.id,
        name: userInfo.name,
        avatar: userInfo.avatar,
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        scopes: "user.info,user.info.shades,user.info.softmemory,note.add,chat",
      },
    });

    // 设置 cookie 并重定向到竞技场
    const response = NextResponse.redirect(new URL("/arena", request.url));
    response.cookies.set("userId", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 天
    });

    return response;
  } catch (error) {
    console.error("OAuth 回调处理失败:", error);
    return NextResponse.json(
      { error: "登录失败，请重试" },
      { status: 500 }
    );
  }
}
