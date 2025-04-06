import WorkDetail from "@/app/components/workDetail";
import { getWorks } from "@/app/lib/getWork";
import { WorkCompilationData } from "@/app/value/data";
import Link from "next/link";
import Work from "../work";

type Props = Readonly<{
    params: Promise<{ id: string; }>;
}>;

export default async function Page({ params }: Props) {

    const { id } = await params
    const works: WorkCompilationData[] = await getWorks()
    const work = works.filter((work) => { return work.id === id })[0]

    return <div className="p-5">
        <Link href={`/works`} className="text-2xl text-slate-50 font-bold">
            《 作品一覧へ
        </Link>
        <hr className="my-2" />
        <WorkDetail work={work} />

        <hr className="my-2" />
        <div className="text-2xl my-2 text-slate-50 font-bold">
            他の作品
        </div>
        <div className="scroller flex flex-nowrap overflow-x-auto w-full gap-2">
            {
                works.filter((work) => {
                    return work.id !== id
                }).map((work) => (
                    <Work work={work} key={work.id} />
                ))
            }
        </div>
    </div>
};