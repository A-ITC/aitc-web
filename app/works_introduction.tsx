import Link from "next/link";
import Image from "next/image";
import { WorkThumbnailData } from "./value/data";
import { apiURL } from "./lib/image";

interface WorksIntroductionProps {
    works: WorkThumbnailData[]
}

export default function WorksIntroduction({ works }: WorksIntroductionProps) {
    return (
        <div className="w-full m-2 p-2 max-w-lg">
            <div className="relative h-96">
                <div className="z-10 absolute right-2 bottom-1 w-52 border border-neutral-100/50"></div>
                <div className="z-10 absolute right-3 bottom-2 w-60 border border-neutral-100/50"></div>
                <div className="z-10 absolute left-1 top-2 w-52 border border-neutral-100/50"></div>
                <div className="z-10 absolute left-2 top-1 h-52 border border-neutral-100/50"></div>
                <div className="z-10 absolute left-1 top-7 h-32 border border-neutral-100/50"></div>

                <div className="text-3xl font-bold"> About us</div>
                <div className="z-10 absolute left-3 bottom-12 bg-neutral-100/40 py-1 px-0.5 text-neutral-900 drop-shadow-lg backdrop-blur-sm rounded-sm overflow-hidden text-lg">
                    AITCではイラストや作曲などを行っています<br />作品はdiscordに共有したりイベントに出品したりしています
                </div>

                <div className="z-0 absolute left-32 top-4 w-52 h-52 rounded overflow-hidden drop-shadow">
                    {
                        works.length == 0 ? <></> :
                            <Image src={apiURL(`api/work?file=${works[0].thumbnail}`)} alt={works[0].id} fill={true} className="object-cover h-full w-full" />
                    }
                </div>
                <div className="z-0 absolute -left-4 top-10 w-52 h-52 rounded overflow-hidden drop-shadow">
                    {
                        works.length == 0 ? <></> :
                            <Image src={apiURL(`api/work?file=${works[1].thumbnail}`)} alt={works[1].id} fill={true} className="object-cover h-full w-full" />
                    }
                </div>
                <Link href="/works" className="z-20 absolute right-2 bottom-0 flex items-center justify-center gap-2 flex-col p-2 bg-neutral-200 hover:scale-110 hover:bg-teal-800 w-44 cursor-pointer rounded overflow-hidden drop-shadow-md transition text-neutral-900 hover:text-neutral-100">
                    <div className="text-2xl font-bold">
                        作品を見る
                    </div>
                </Link>
            </div>
        </div>
    )
}