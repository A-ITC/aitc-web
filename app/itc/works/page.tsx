import Image from "next/image";
import { getWorks } from "@/app/lib/getWork"
import { apiURL } from "@/app/lib/image"
import WindowFrame from "../components/windowFrame";

export default async function Page() {
    const works = await getWorks()

    return <WindowFrame>
        <div className="overflow-x-auto w-full">
            <table className="border-separate border-spacing-3">
                <thead>
                    <tr>
                        <th>thumbnail</th>
                        <th className="text-left">title</th>
                        <th className="text-left">text</th>
                        <th className="text-left">released_at</th>
                        <th className="text-left">id</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        works.map((work) => {
                            return <tr key={work.id}>
                                <td className="aspect-square h-24 w-24 relative m-2">
                                    <Image src={apiURL(`api/work?file=${work.thumbnail}`)} alt={work.id} fill={true} className="object-cover" />
                                </td>
                                <td className="font-semibold">
                                    {work.title}
                                </td>
                                <td className="text-sm">
                                    {work.text}
                                </td>
                                <td className="text-sm text-neutral-500">
                                    {work.released_at}
                                </td>
                                <td className="text-sm text-neutral-500">
                                    {work.id}
                                </td>
                            </tr>
                        })
                    }
                </tbody>
            </table>
        </div>
    </WindowFrame>
}