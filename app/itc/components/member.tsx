import { MemberData } from "@/app/lib/member";
import Link from "next/link";

interface MemberProps {
    data: MemberData
}

export default function Member({ data }: MemberProps) {
    return <Link href={`/itc/users/${data.id}`} className="m-1 hover:underline">
        {data.name}
    </Link>
}