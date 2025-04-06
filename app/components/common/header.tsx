import { imgURL } from "@/app/lib/image";
import Image from "next/image";
import Link from "next/link";

export default function Header() {
    return (
        <div className="bg-neutral-900 flex space-x-4 backdrop-blur px-2">
            <div className="h-20 w-20 font-bold overflow-hidden relative">
                <Link href="/"><Image fill src={imgURL("logos/aitc_logo_transparent_no_word.png")} alt={"A-ITC"} className="h-full w-full scale-110"></Image></Link>
            </div>
            <div className="flex py-5 space-x-4 text-neutral-50">
                <div className="border border-neutral-100 mx-2"></div>
                <div className="flex space-x-4 items-center text-lg">
                    <div><Link href="/works" className="hover:underline">作品</Link></div>
                    <div><Link href="/links" className="hover:underline">リンク</Link></div>
                </div>
            </div>
        </div>
    );
}
