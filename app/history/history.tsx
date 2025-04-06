import { HistoryData } from "../value/history";

interface HistoryProps {
    data: HistoryData
}

export default function HistoryEvent({ data }: HistoryProps) {
    return (
        <div className="bg-slate-100 bg-opacity-80 rounded-sm my-5 p-2">
            <h1 className="text-xl font-bold">{data.title}</h1>
            <hr />
            <p className="text-sm">{data.time}</p>
            {data.texts.map((t, index) => {
                return <p key={t + index}>{t}</p>
            })}
        </div>
    );
}
