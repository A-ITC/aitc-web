import { getWorks } from "../lib/getWork";
import { WorkCompilationData } from "../value/data";
import Work from "./work";

export default async function Page() {

    const works: WorkCompilationData[] = await getWorks()

    return (
        <div className="m-5 text-neutral-50 p-3">
            <div>
                <p className="text-4xl font-bold">Works</p>
                <p>作品集</p>
            </div>
            <hr className="w-9/12 m-10" />
            <div className="m-2">
                <p className="text-2xl">Releases</p>
                <p>作品</p>
            </div>
            <div className="scroller flex flex-nowrap overflow-x-auto w-full gap-2">
                {
                    works.map((work) => (
                        <Work work={work} key={work.id} />
                    ))
                }
            </div>
            <hr className="w-9/12 m-10" />
            <div className="m-2">
                <p className="text-2xl">Works</p>
                <p>個人作品</p>
            </div>
            <div className="scroller flex flex-nowrap overflow-x-auto w-full gap-2 scroll-shadows">
                <p>Coming soon!</p>
            </div>
        </div>
    );
}
