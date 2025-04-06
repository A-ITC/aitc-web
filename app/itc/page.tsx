
import { getMembers, getRoles } from "../lib/member"
import Members from "./components/members"

export default async function Page() {
    const members = await getMembers()
    const roles = await getRoles()

    return <div className="">
        <Members data={members} roles={roles} />
    </div>
}