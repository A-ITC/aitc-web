import LoginDiscord from "./components/discord_login";
import { getVerifiedToken } from "../lib/token";
import { AuthProvider } from "../lib/authContext";
import Menu from "./components/menu";

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const token = await getVerifiedToken()
    return (
        <div className="text-neutral-50 p-5">
            {
                (!token) ?
                    <LoginDiscord />
                    :
                    <AuthProvider token={token}>
                        <div className="flex gap-1">
                            <Menu username={token.username ?? "error!"} />
                            {children}
                        </div>
                    </AuthProvider>

            }
        </div>
    )
}
