
import fs from "node:fs";
import path from 'path';
import { HistoryData } from "../value/history";

export const getHistory = async () => {
    const file = path.join(process.cwd(), `assets/history/data.json`); // 画像のパス
    const dataJson = await fs.promises.readFile(file, 'utf-8')
    const dat: HistoryData[] = JSON.parse(dataJson)
    return dat
}