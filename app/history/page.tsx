import { getHistory } from "../lib/history";
import { HistoryData } from "../value/history";
import HistoryEvent from "./history";

export default async function Page() {

    const data: HistoryData[] = await getHistory()

    return (
        <div className="p-10">
            <div className="text-5xl text-slate-50 font-bold">
                これまでの歴史
            </div>
            <hr className="my-2" />
            {data.map((dat) => {
                return <HistoryEvent key={dat.title} data={dat} />
            })}
        </div>
    );
}
