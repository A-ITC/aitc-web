"use client"
import { MemberData, RoleData } from "@/app/lib/member";

interface MemberProps {
    roles: RoleData[]
    onGroupBySelected: (role: string) => void
}

export default function MemberFilter({ roles, onGroupBySelected }: MemberProps) {
    return <div className="m-1 flex flex-wrap flex-row bg-neutral-800 border rounded border-neutral-600 bg-opacity-60 p-2 ">
        group by
        <select name="pets" id="pet-select" className="bg-neutral-600 rounded shadow-md m-1 text-sm" onChange={(e) => { onGroupBySelected(e.currentTarget.value) }}>
            <option value="">select role</option>
            {
                roles.map((role) => {
                    return <option value={role.id} key={role.id}>{role.name}</option>
                })
            }
        </select>
    </div>
}