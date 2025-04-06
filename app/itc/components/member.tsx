import { MemberData } from "@/app/lib/member";

interface MemberProps {
    data: MemberData
}

export default function Member({ data }: MemberProps) {
    return <div className="m-1 hover:underline">
        {data.name}
    </div>
}