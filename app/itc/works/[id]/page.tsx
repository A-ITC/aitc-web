import { getWorks } from "@/app/lib/getWork"
import WindowFrame from "../../components/windowFrame"

export default async function Page({
    id,
}: {
    id: Promise<{ id: string }>
}) {
    const works = await getWorks()
    return <WindowFrame></WindowFrame>
}