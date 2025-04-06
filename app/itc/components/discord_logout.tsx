"use client"

import { apiURL } from "@/app/lib/image";
import { useRouter } from "next/navigation";

export default function LogoutDiscord() {
    const router = useRouter();
    const logout = async () => {
        await fetch(apiURL('api/auth/logout'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        router.push("/")
    };

    return <button className="basis-full" onClick={() => { logout() }}>
        ログアウト
    </button>;
}