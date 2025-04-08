import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { signToken } from "@/app/lib/token";

export async function GET(request: NextRequest) {

  const code = request.nextUrl.searchParams.get('code');

  const client_redirect = process.env.NODE_ENV === "development" ?
    `https://aitc.eulious.com/kyoichi/dev/itc` :
    `https://aitc.eulious.com/kyoichi/itc`

  if (!code) {
    const response = NextResponse.redirect(client_redirect + `?error=${"Authorization code is missing"}`);
    return response
  }

  const data = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID as string,
    client_secret: process.env.DISCORD_CLIENT_SECRET as string,
    grant_type: 'authorization_code',
    code,
    redirect_uri: process.env.DISCORD_REDIRECT_URI as string,
  });

  try {
    // アクセストークンを取得
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      body: data,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      const response = NextResponse.redirect(client_redirect + `?error=${tokenData.error_description}`);
      return response
    }

    // ユーザー情報を取得
    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const userData = await userResponse.json();

    if (!userResponse.ok) {
      const response = NextResponse.redirect(client_redirect + `?error=${tokenData.error_description}`);
      return response
    }
    // 所属しているギルド情報を取得
    const guildsResponse = await fetch('https://discord.com/api/users/@me/guilds', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });
    const guilds: { id: string }[] = await guildsResponse.json();
    // ✅ 特定のギルドに所属しているか判定
    const isMember = guilds.some(guild => guild.id === process.env.DISCORD_TARGET_GUILD_ID);

    if (!isMember) {
      const response = NextResponse.redirect(client_redirect + `?error=${"you are not in ITC server"}`);
      return response
    }

    // JWT を生成してクッキーに保存
    const token = signToken({
      id: userData.id,
      username: userData.username,
      avatar: userData.avatar,
    });

    const response = NextResponse.redirect(client_redirect);

    const cookieStore = await cookies()
    cookieStore.set("token", token, {
      secure: true, maxAge: 60 * 60 * 24 * 7, // 7 days
    })
    return response;

  } catch (error) {
    console.error('Error:', error);
    const response = NextResponse.redirect(client_redirect + `?error=${"Internal Server Error"}`);
    return response
  }

}