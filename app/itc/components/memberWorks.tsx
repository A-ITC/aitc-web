import { getMember, getRoles, MemberData, RoleData } from "@/app/lib/member";
import Link from "next/link";
import Image from "next/image";
import { getMemberWorks, getWork, getWorks } from "@/app/lib/getWork";
import { apiURL } from "@/app/lib/image";
import { WorkCompilationData, WorkData } from "@/app/value/data";

interface RoleProps {
    roles: RoleData[]
    r: string
}

function hexToRgb(hex: string, alpha: number) {
    hex = hex.replace(/^#/, ''); // 先頭の#を取り除く
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b},${alpha})`;
}

function findRole(roles: RoleData[], id: string): RoleData | undefined {
    for (let i of roles) {
        if (i.id === id) return i
        let f = findRole(i.roles ?? [], id)
        if (f !== undefined) return f
    }
    return undefined
}
function Role({ roles, r }: RoleProps) {
    const s = findRole(roles, r)
    if (!s) return <div>a</div>
    return <div style={{ color: s.color, backgroundColor: hexToRgb(s.color, 0.15) }} key={r} className="rounded-lg px-2">
        {
            s.name
        }
    </div>
}

interface WorkProps {
    works: WorkCompilationData[]
    title: string
    id: string
}

async function Work({ works, title, id }: WorkProps) {
    const work = works.find((w) => w.id === id)
    if (!work) {
        return <></>
    }
    return <tr className="py-2">
        <td className=" aspect-square h-24 w-24 relative m-2">
            <Link href={`/itc/works/${id}`}>
                <Image src={apiURL(`api/work?file=${work.thumbnail}`)} alt={work.id} fill={true} className="object-cover" />
            </Link>
        </td>
        <td className="">
            <Link href={`/itc/works/${id}`} className="hover:underline">
                {
                    work.title
                }
            </Link>
        </td>
        <td className="">
            {
                title
            }
        </td>
        <td className=" text-sm text-neutral-500">
            {
                work.released_at
            }
        </td>
    </tr>
}

interface MemberWorksProps {
    id: string
}

export default async function MemberWorks({ id }: MemberWorksProps) {

    const works = await getWorks()
    const memberWorks = await getMemberWorks(id)
    const member = await getMember(id)
    const roles = await getRoles()

    if (!member) {
        return <div className="bg-neutral-800 border rounded border-neutral-600 bg-opacity-60 p-2 w-full overflow-x-auto">
            error! '{id}'
        </div>
    }

    return <div className="bg-neutral-800 border rounded border-neutral-600 bg-opacity-60 p-2 w-full overflow-x-auto">
        <div className="font-bold text-2xl">
            {
                member.name
            }
        </div>
        <div className="flex gap-1">
            {
                member.roles.map((r) => <Role roles={roles} r={r} key={r} />)
            }
        </div>
        <hr className="m-2 border-neutral-500" />
        <div className="font-bold text-xl flex items-center gap-1">
            <div>
                作品
            </div>
            <div className="text-sm">
                ({memberWorks.length})
            </div>
        </div>
        {
            memberWorks.length === 0 ?
                <div>作品がありません</div> :
                <table className="w-full border-separate border-spacing-2">
                    <thead>
                        <tr>
                            <th>thumbnail</th>
                            <th className="text-left">企画名</th>
                            <th className="text-left">作品名</th>
                            <th className="text-left">released_at</th>
                        </tr>
                    </thead>
                    <tbody className="">
                        {
                            memberWorks.map((w, i) => <Work works={works} title={w.title} id={w.work_id} key={w.work_id + i} />)
                        }
                    </tbody>
                </table>
        }
    </div>
}

