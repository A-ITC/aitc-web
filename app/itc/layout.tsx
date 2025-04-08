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
                        <div className="grid grid-cols-12 gap-1">
                            <div className="col-span-2">
                                <Menu username={token.username ?? "error!"} />
                            </div>
                            <div className="col-span-10">
                                {children}
                            </div>
                        </div>
                    </AuthProvider>
            }
        </div>
    )
}
