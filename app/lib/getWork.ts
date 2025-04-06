/* eslint @typescript-eslint/no-explicit-any: 0 */

import fs from "node:fs";
import path from 'path';

import { WorkCompilationData } from "../value/data"

const getWorksPath = () => {
    const workPath = path.join(process.cwd(), 'assets/works/meta.json'); // 画像のパス
    return workPath;
}

export const getWorks = async () => {
    try {
        const dataJson = await fs.promises.readFile(getWorksPath(), 'utf-8')
        const dat: WorkCompilationData[] = JSON.parse(dataJson)
        return dat
    } catch (e: any) {
        console.log("error" + e)
        return []
    }
}

export const getMemberWorks = async (member_id: string) => {
    try {
        const dataJson = await fs.promises.readFile(getWorksPath(), 'utf-8')
        const dat: WorkCompilationData[] = JSON.parse(dataJson)
        let res: { work_id: string, title: string }[] = []
        for (let d of dat) {
            for (let e of d.data) {
                for (let f of e.data) {
                    if (f.people.findIndex(b => b.id === member_id) === -1) {
                        continue
                    }
                    res.push({
                        work_id: d.id,
                        title: f.title
                    })
                }
            }
        }
        return res
    } catch (e: any) {
        console.log("error" + e)
        return []
    }
}