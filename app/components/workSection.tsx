
import { WorkSectionData } from "@/app/value/data";
import { getMember } from "../lib/member";
import WorkMember from "./workMember";

type Props = Readonly<{
    params: { section: WorkSectionData; };
}>;

export default async function WorkSection({ params }: Props) {


    return <div>
        <div className="text-2xl font-bold">{params.section.header}</div>
        {
            params.section.data.map(async (dat, index) => {
                console.log(dat.people)
                return <div className="flex w-full" key={dat.title + index}>
                    <div className="text-lg flex-none font-bold">{index + 1 + ". "}</div>
                    <div className="text-lg flex-1 font-bold">{dat.title}</div>
                    <div className="flex-1">{
                        dat.people.map((p, index) => <WorkMember params={p} key={index} />)
                    }
                    </div>
                </div>
            })
        }
    </div>
};