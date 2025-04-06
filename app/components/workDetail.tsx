
import Image from "next/image";
import { Suspense } from "react";
import { WorkCompilationData } from "@/app/value/data";
import WorkSection from "./workSection";
import { apiURL } from "../lib/image";

interface WorkDetailProps {
    work: WorkCompilationData;
}

export default async function WorkDetail({ work }: WorkDetailProps) {

    const d = new Date(work.released_at)

    return <div className="md:h-full w-full">
        <div className="p-2 md:h-full w-full bg-neutral-100/50 backdrop-blur-sm rounded-md overflow-hidden bg-neutral-300 border-2 border-neutral-0">
            <p className="text-3xl my-2 font-bold text-left">{work.title}</p>
            <div className="flex flex-row flex-wrap md:h-full w-full gap-3">
                <div className="basis-full md:basis-1/4">
                    <Image src={apiURL(`api/work?file=${work.thumbnail}`)} alt={work.id} width={1000} height={1000} className="w-full object-contain" />
                    <p className="text-left">リリース日 : {d.getFullYear()}年{d.getMonth()}月{d.getDate()}日</p>
                    <div className="flex">
                        {
                            work.tags.map((tag, index) => (
                                <div className={`bg-teal-600 px-1 rounded overflow-hidden`} key={`${tag}-${index}`}>
                                    {tag}
                                </div>
                            ))
                        }
                    </div>
                    <p>{work.text}</p>
                </div>
                <hr className="w-9/12 md:w-0 m-3" />
                <div className="basis-full md:basis-2/4 flex flex-col items-start">
                    {
                        work.embed !== undefined && work.embed !== "" &&
                        <Suspense fallback={<p>Loading...</p>}>
                            <div dangerouslySetInnerHTML={{ __html: work.embed }} className="w-full"></div>
                        </Suspense>
                    }
                    <hr className="w-9/12 m-3" />
                    <div className="flex flex-col gap-1 items-start w-full">
                        <p className="text-3xl">作者</p>
                        {
                            work.data.map((dat, index) => {
                                return <div key={dat.header + index} className="w-full">
                                    <hr className="my-2" />
                                    <WorkSection params={{
                                        section: dat
                                    }} />
                                </div>
                            })
                        }
                    </div>
                </div>
            </div>
        </div>
    </div>
};