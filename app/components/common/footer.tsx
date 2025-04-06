import Link from "next/link";

export default function Footer() {
    return (
        <div className="bg-neutral-900 p-5">
            <div className="text-neutral-100 font-bold"><Link href="/" className=" hover:underline">A-ITC</Link></div>

            <hr className="w-full max-w-3xl my-2 border-neutral-600" />

            <div className="flex space-x-2">
                <Link href="/works" className="text-neutral-100 hover:underline">作品</Link>
                <Link href="/links" className="text-neutral-100 hover:underline">リンク</Link>
            </div>

            <div className="text-neutral-100 my-2 text-xs">© 2021-2024 AITC All Rights Reserved.</div>

            <hr className="w-full max-w-3xl my-2 border-neutral-600" />

            <Link href="/itc" className="text-neutral-100 text-opacity-20 text-sm">部員向けページ</Link>

        </div>
    );
}
