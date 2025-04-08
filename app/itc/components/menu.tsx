"use client"
import Link from "next/link"
import LogoutDiscord from "./discord_logout"

interface MenuProps {
    username: string
}

export default function Menu({ username }: MenuProps) {

    const menus = [
        {
            link: "/itc/users",
            name: "ユーザー",
            path: "M144 0a80 80 0 1 1 0 160A80 80 0 1 1 144 0zM512 0a80 80 0 1 1 0 160A80 80 0 1 1 512 0zM0 298.7C0 239.8 47.8 192 106.7 192l42.7 0c15.9 0 31 3.5 44.6 9.7c-1.3 7.2-1.9 14.7-1.9 22.3c0 38.2 16.8 72.5 43.3 96c-.2 0-.4 0-.7 0L21.3 320C9.6 320 0 310.4 0 298.7zM405.3 320c-.2 0-.4 0-.7 0c26.6-23.5 43.3-57.8 43.3-96c0-7.6-.7-15-1.9-22.3c13.6-6.3 28.7-9.7 44.6-9.7l42.7 0C592.2 192 640 239.8 640 298.7c0 11.8-9.6 21.3-21.3 21.3l-213.3 0zM224 224a96 96 0 1 1 192 0 96 96 0 1 1 -192 0zM128 485.3C128 411.7 187.7 352 261.3 352l117.3 0C452.3 352 512 411.7 512 485.3c0 14.7-11.9 26.7-26.7 26.7l-330.7 0c-14.7 0-26.7-11.9-26.7-26.7z"
        },
        {
            link: "/itc/works",
            name: "作品",
            path: "M0 64C0 28.7 28.7 0 64 0L224 0l0 128c0 17.7 14.3 32 32 32l128 0 0 125.7-86.8 86.8c-10.3 10.3-17.5 23.1-21 37.2l-18.7 74.9c-2.3 9.2-1.8 18.8 1.3 27.5L64 512c-35.3 0-64-28.7-64-64L0 64zm384 64l-128 0L256 0 384 128zM549.8 235.7l14.4 14.4c15.6 15.6 15.6 40.9 0 56.6l-29.4 29.4-71-71 29.4-29.4c15.6-15.6 40.9-15.6 56.6 0zM311.9 417L441.1 287.8l71 71L382.9 487.9c-4.1 4.1-9.2 7-14.9 8.4l-60.1 15c-5.5 1.4-11.2-.2-15.2-4.2s-5.6-9.7-4.2-15.2l15-60.1c1.4-5.6 4.3-10.8 8.4-14.9z"
        },
        {
            link: "/itc",
            name: "ロール",
            path: "M345 39.1L472.8 168.4c52.4 53 52.4 138.2 0 191.2L360.8 472.9c-9.3 9.4-24.5 9.5-33.9 .2s-9.5-24.5-.2-33.9L438.6 325.9c33.9-34.3 33.9-89.4 0-123.7L310.9 72.9c-9.3-9.4-9.2-24.6 .2-33.9s24.6-9.2 33.9 .2zM0 229.5L0 80C0 53.5 21.5 32 48 32l149.5 0c17 0 33.3 6.7 45.3 18.7l168 168c25 25 25 65.5 0 90.5L277.3 442.7c-25 25-65.5 25-90.5 0l-168-168C6.7 262.7 0 246.5 0 229.5zM144 144a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z"
        }
    ]

    return <div className="flex flex-wrap flex-col bg-neutral-800 border rounded border-neutral-600 bg-opacity-60 p-2 items-center gap-1 text-lg font-semibold h-min">
        <Link href={"/itc"} className="p-2 flex items-center justify-center gap-2 w-full hover:bg-neutral-50 hover:bg-opacity-20 rounded-md">
            {username}
        </Link>
        <hr className="w-full border-neutral-600 my-2" />
        {
            menus.map((m) => <Link href={m.link} className="p-2 flex items-center justify-center gap-2 w-full hover:bg-neutral-50 hover:bg-opacity-20 rounded-md" key={m.name}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" className="fill-neutral-50" width={20} height={20}>
                    <path d={m.path} />
                </svg>
                {
                    m.name
                }
            </Link>
            )
        }
        <hr className="w-full border-neutral-600 my-2" />
        <LogoutDiscord />
    </div>
}
