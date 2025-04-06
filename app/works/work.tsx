
import Image from "next/image";
import Link from "next/link";
import { WorkThumbnailData } from "../value/data";
import { apiURL } from "../lib/image";

interface WorkProps {
    work: WorkThumbnailData;
}

export default function Work({ work }: WorkProps) {
    const color = ["bg-teal-500", "bg-red-500"]

    return (
        <Link href={`/works/${work.id}`} className="flex-none relative aspect-square w-60 cursor-pointer bg-neutral-600 rounded-md overflow-hidden">
            <Image src={apiURL(`api/work?file=${work.thumbnail}`)} alt={work.id} fill={true} className="object-cover" />
            <div className={"hover:bg-neutral-900/50 bg-neutral-900/0 absolute top-0 left-0 h-full w-full transition"}></div>
            <div className={"absolute top-0 left-0 py-1"}>
                {
                    work.tags.map((tag) => (
                        <div className={`${color[0]} px-1 rounded overflow-hidden`} key={tag}>
                            {tag}
                        </div>
                    ))
                }
            </div>
        </Link>
    );
}
