import { getWorks } from "@/app/lib/getWork"

export default async function Page({
    id,
}: {
    id: Promise<{ id: string }>
}) {
    const works = await getWorks()
    return <div className="bg-neutral-800 border rounded border-neutral-600 bg-opacity-60 p-2 w-full overflow-x-auto">

    </div>
}