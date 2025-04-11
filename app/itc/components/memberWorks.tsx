import { getMember, getMembers, getRoles, MemberData, RoleData } from "@/app/lib/member";
import Link from "next/link";
import Image from "next/image";
import { getMemberWorks, getWork, getWorks } from "@/app/lib/getWork";
import { apiURL } from "@/app/lib/image";
import { WorkCompilationData, WorkData } from "@/app/value/data";
import Member from "./member";
import WindowFrame from "./windowFrame";

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
    return <div style={{ color: s.color, backgroundColor: hexToRgb(s.color, 0.15) }} key={r} className="rounded-lg px-2 inline">
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
        <td className=" aspect-square h-20 w-20 relative m-2">
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

interface SimilarMembersProps {
    members: MemberData[]
    roles: RoleData[]
    own_member_id: string
    same_role: string
}
async function SimilarMembers({ members, roles, own_member_id, same_role }: SimilarMembersProps) {
    const ms = members.filter((m) => m.roles.includes(same_role) && m.id !== own_member_id)
    if (ms.length === 0) {
        return <></>
    }
    return <div className="w-full my-4">
        <div className="w-full flex items-center gap-2">
            <Role roles={roles} r={same_role} />
            <hr className="grow border-neutral-600" />
        </div>
        <div className="flex flex-wrap gap-2 w-full p-2">
            {
                ms.map((m) => <div className="text-sm">
                    <Member data={m} />
                </div>)
            }
        </div>
    </div>
}

interface MemberWorksProps {
    id: string
}

export default async function MemberWorks({ id }: MemberWorksProps) {

    const works = await getWorks()
    const memberWorks = await getMemberWorks(id)
    const members = await getMembers()
    const member = members.find((m) => m.id === id)
    const roles = await getRoles()

    if (!member) {
        return <WindowFrame>
            error! '{id}'
        </WindowFrame>
    }

    return <WindowFrame>
        <div className="font-bold text-2xl m-2">
            {
                member.name
            }
        </div>
        <div className="flex flex-wrap gap-1">
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
                <div className="w-full  overflow-x-auto">
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
                </div>
        }

        <hr className="m-2 border-neutral-500" />
        <div className="font-bold text-xl">
            類似するメンバー
        </div>
        <div className="w-full p-2">
            {
                member.roles.map((r) => <SimilarMembers members={members} roles={roles} own_member_id={id} same_role={r} />)
            }
        </div>
    </WindowFrame>
}

