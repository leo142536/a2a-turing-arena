// 登录路由 - 重定向到 SecondMe OAuth 授权页面
import { NextResponse } from "next/server";
import { getAuthUrl } from "@/lib/secondme";

export async function GET() {
  const appId = process.env.SECONDME_APP_ID;
  const redirectUri = process.env.SECONDME_REDIRECT_URI;

  if (!appId || !redirectUri) {
    return NextResponse.json(
      { error: "缺少 SecondMe 配置，请检查环境变量" },
      { status: 500 }
    );
  }

  // 生成授权 URL 并重定向
  const authUrl = getAuthUrl(appId, redirectUri);
  return NextResponse.redirect(authUrl);
}
