import { getMemberWorks } from "@/app/lib/getWork"
import { getMember, getRoles } from "@/app/lib/member"
import MemberWorks from "../../components/memberWorks"

export default async function Page({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params

    return <MemberWorks id={id} />
}