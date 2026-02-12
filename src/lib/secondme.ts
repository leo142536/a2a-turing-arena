// SecondMe API 封装
// 包含 OAuth 授权、用户信息获取、聊天流等功能

const API_BASE = process.env.SECONDME_API_BASE || "https://app.mindos.com/gate/lab";
const OAUTH_URL = process.env.SECONDME_OAUTH_URL || "https://go.second.me/oauth/";

// ============ OAuth 相关 ============

/**
 * 生成 SecondMe OAuth 授权 URL
 * @param appId 应用 ID
 * @param redirectUri 回调地址
 * @param scopes 权限范围数组
 */
export function getAuthUrl(
  appId: string,
  redirectUri: string,
  scopes: string[] = ["user.info", "user.info.shades", "user.info.softmemory", "note.add", "chat"]
): string {
  const params = new URLSearchParams({
    app_id: appId,
    redirect_uri: redirectUri,
    scope: scopes.join(","),
    response_type: "code",
  });
  return `${OAUTH_URL}?${params.toString()}`;
}

/**
 * 用授权码换取 access token
 */
export async function exchangeToken(
  code: string,
  appId: string,
  appSecret: string,
  redirectUri: string
): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
  const res = await fetch(`${API_BASE}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "authorization_code",
      code,
      app_id: appId,
      app_secret: appSecret,
      redirect_uri: redirectUri,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`换取 token 失败: ${res.status} ${text}`);
  }

  const data = await res.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
  };
}

/**
 * 刷新 access token
 */
export async function refreshAccessToken(
  refreshTokenStr: string,
  appId: string,
  appSecret: string
): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
  const res = await fetch(`${API_BASE}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "refresh_token",
      refresh_token: refreshTokenStr,
      app_id: appId,
      app_secret: appSecret,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`刷新 token 失败: ${res.status} ${text}`);
  }

  const data = await res.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
  };
}

// ============ 用户信息相关 ============

/**
 * 获取用户基本信息
 */
export async function getUserInfo(token: string): Promise<{
  id: string;
  name: string;
  avatar: string;
}> {
  const res = await fetch(`${API_BASE}/user/info`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error(`获取用户信息失败: ${res.status}`);
  }

  const json = await res.json();
  const data = json.result?.data || json.data || json;
  return {
    id: data.id || data.user_id || "",
    name: data.name || data.nickname || "未知用户",
    avatar: data.avatar || data.avatar_url || "",
  };
}

/**
 * 获取用户兴趣标签（shades）
 */
export async function getUserShades(token: string): Promise<string[]> {
  const res = await fetch(`${API_BASE}/user/shades`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error(`获取兴趣标签失败: ${res.status}`);
  }

  const json = await res.json();
  const data = json.result?.data || json.data || json;
  return data.shades || [];
}

/**
 * 获取用户软记忆
 */
export async function getUserSoftMemory(token: string): Promise<string[]> {
  const res = await fetch(`${API_BASE}/user/softmemory`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error(`获取软记忆失败: ${res.status}`);
  }

  const json = await res.json();
  const data = json.result?.data || json.data || json;
  return data.list || [];
}

// ============ SSE 流解析 ============

/**
 * 解析 SSE 流，提取文本内容
 * 返回完整的拼接文本
 */
export async function parseSseStream(response: Response): Promise<string> {
  const reader = response.body?.getReader();
  if (!reader) throw new Error("无法读取响应流");

  const decoder = new TextDecoder();
  let result = "";
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    // 保留最后一个可能不完整的行
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (line.startsWith("data:")) {
        const data = line.slice(5).trim();
        if (data === "[DONE]") continue;
        try {
          const parsed = JSON.parse(data);
          // 兼容多种 SSE 数据格式
          const content =
            parsed.choices?.[0]?.delta?.content ||
            parsed.content ||
            parsed.text ||
            parsed.message ||
            "";
          if (content) result += content;
        } catch {
          // 非 JSON 数据，直接拼接
          if (data && data !== "[DONE]") result += data;
        }
      }
    }
  }

  return result;
}

// ============ 聊天相关 ============

/**
 * 发起 SSE 流式聊天
 */
export async function chatStream(
  token: string,
  message: string,
  sessionId?: string,
  systemPrompt?: string
): Promise<string> {
  const body: Record<string, unknown> = { message };
  if (sessionId) body.session_id = sessionId;
  if (systemPrompt) body.system_prompt = systemPrompt;

  const res = await fetch(`${API_BASE}/chat/stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`聊天请求失败: ${res.status} ${text}`);
  }

  return parseSseStream(res);
}

/**
 * 发起 Act 流式请求（结构化判断）
 * 用于让 AI 做出结构化的决策/判断
 */
export async function actStream(
  token: string,
  message: string,
  actionControl: string,
  sessionId?: string,
  systemPrompt?: string
): Promise<string> {
  const body: Record<string, unknown> = {
    message,
    action_control: actionControl,
  };
  if (sessionId) body.session_id = sessionId;
  if (systemPrompt) body.system_prompt = systemPrompt;

  const res = await fetch(`${API_BASE}/act/stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Act 请求失败: ${res.status} ${text}`);
  }

  return parseSseStream(res);
}
