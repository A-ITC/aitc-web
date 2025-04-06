"use client"
import { MemberData, RoleData } from "@/app/lib/member";
import Member from "./member";
import MemberFilter from "./memberFilter";
import { useState } from "react";

interface MembersProps {
    data: MemberData[]
    roles: RoleData[]
}

function GroupedMembers(role: RoleData, members: MemberData[]) {
    const m = members.filter((member) => member.roles.includes(role.id))

    if (m.length === 0) {
        return <div></div>
    }

    return <div className="my-4">
        <div className="flex items-center gap-1">
            <div style={{ color: role.color }}>
                {role.name}
            </div>
            <div className="text-sm">
                {
                    `(${m.length})`
                }
            </div>
            <hr className="grow border-neutral-600" />
        </div>
        <div className=" flex flex-wrap" key={role.id}>
            {
                m.map((member) => {
                    return <div className="" key={member.id}>
                        <Member data={member} />
                    </div>
                })
            }
        </div>
    </div>
}

export default function Members({ data, roles }: MembersProps) {

    const groupby = "18b93c13-5112-4421-b736-9f07f118b45a" //n期生のID
    const [groupedRoles, setGroupRoles] = useState<RoleData | undefined>(roles.find((role) => role.id === groupby))

    return <div className="bg-neutral-800 border rounded border-neutral-600 bg-opacity-60 p-2 ">
        <MemberFilter roles={roles} onGroupBySelected={(role) => {
            console.log("on select")
            setGroupRoles(roles.find((r) => r.id === role))
        }} />
        {
            groupedRoles?.roles?.map((role) => {
                return <div key={role.id}>
                    {
                        GroupedMembers(role, data)
                    }
                </div>
            }) ?? <div>error!</div>
        }
    </div>
}