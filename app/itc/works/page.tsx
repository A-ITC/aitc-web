import Image from "next/image";
import { getWorks } from "@/app/lib/getWork"
import { apiURL } from "@/app/lib/image"

export default async function Page() {
    const works = await getWorks()

    return <div className="bg-neutral-800 border rounded border-neutral-600 bg-opacity-60 p-2 w-full overflow-x-auto">
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
}