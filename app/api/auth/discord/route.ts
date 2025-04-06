import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const redirect_uri = process.env.NODE_ENV === "development" ?
        `https%3A%2F%2Faitc.eulious.com%2Fkyoichi%2Fdev%2Fapi%2Fauth%2Fdiscord%2Fcallback` :
        `https%3A%2F%2Faitc.eulious.com%2Fkyoichi%2Fapi%2Fauth%2Fdiscord%2Fcallback`
    const path = `https://discord.com/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}&response_type=code&redirect_uri=${redirect_uri}&scope=identify+guilds+guilds.members.read`

    return NextResponse.redirect(path)
}