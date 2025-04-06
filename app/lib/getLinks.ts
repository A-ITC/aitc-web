
import fs from "node:fs";
import path from 'path';
import { LinkData } from "../value/link";

export const getLinks = async () => {
    const file = path.join(process.cwd(), `assets/links.json`); // 画像のパス
    const dataJson = await fs.promises.readFile(file, 'utf-8')
    const dat: LinkData[] = JSON.parse(dataJson)
    return dat
}