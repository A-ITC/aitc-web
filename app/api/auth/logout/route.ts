import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: Request) {

    const client_redirect = process.env.NODE_ENV === "development" ?
        `https://aitc.eulious.com/kyoichi/dev/` :
        `https://aitc.eulious.com/kyoichi/`

    // クッキーを無効化
    const cookieStore = await cookies()
    cookieStore.set('token', '')
    console.log("logout post method")
    const response = NextResponse.redirect(client_redirect);

    return response;
}