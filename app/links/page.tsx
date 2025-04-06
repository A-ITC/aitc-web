import Link from "next/link";
import { getLinks } from "../lib/getLinks";
import { LinkData } from "../value/link";

export default async function Page() {

    const data: LinkData[] = await getLinks()

    return (
        <div className="p-10">
            <div className="text-5xl text-slate-50 font-bold">
                リンク集
            </div>
            <hr className="my-5 border-neutral-50" />
            <table className="  text-neutral-50 text-lg rounded-sm overflow-hidden">
                <tbody>
                    {
                        data.map((link, index) => {
                            return <tr key={index} className="">
                                <th className="w-full md:w-min block md:table-cell text-left bg-neutral-300 bg-opacity-40 p-2">
                                    {link.title}
                                </th>
                                <td className=" block md:table-cell bg-neutral-300 bg-opacity-20 px-1">
                                    <Link href={link.url} className=" hover:underline">
                                        {link.url}
                                    </Link>
                                </td>
                                <td className=" block md:table-cell bg-neutral-300 bg-opacity-20">
                                    {link.text}
                                </td>
                            </tr>
                        })
                    }
                </tbody>
            </table>
        </div>
    );
}
