

import { getVerifiedToken } from "../lib/token"
import MemberWorks from "./components/memberWorks"

export default async function Page() {
    const token = await getVerifiedToken()

    return <MemberWorks id={token?.id ?? ""} />
}