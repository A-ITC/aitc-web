"use client"
import Link from "next/link"
import LogoutDiscord from "./discord_logout"

interface MenuProps {
    username: string
}

export default function Menu({ username }: MenuProps) {
    return <div className="flex flex-wrap flex-row bg-neutral-800 border rounded border-neutral-600 bg-opacity-60 p-2 items-center gap-1">
        <div className="basis-full flex flex-col flex-wrap items-center">
            <div className="basis-full">
                {username}
            </div>
        </div>
        <hr className="w-full border-neutral-600" />
        <Link href={"/itc"}>
            ユーザー
        </Link>
        <Link href={"/itc/works"}>
            作品
        </Link>
        <button className="basis-full">
            ロール
        </button>
        <LogoutDiscord />
    </div>
}