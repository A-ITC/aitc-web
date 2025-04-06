/* eslint @typescript-eslint/no-explicit-any: 0 */

import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from 'path';

const getWorkPath = (filename: string) => {
    return path.join(process.cwd(), `assets/works/${filename}`); // 画像のパス
}

export async function GET(request: NextRequest) {
    try {
        const file = request.nextUrl.searchParams.get('file')
        for (const p of request.nextUrl.searchParams) {
            console.log(p);
        }

        if (file === null) {
            throw `file '${file}' not found`
        }
        console.log(`load ${getWorkPath(file)}`)
        const data = fs.readFileSync(getWorkPath(file))
        const mimeType = "image"
        return new NextResponse(data, {
            headers: {
                'Content-Type': mimeType,
            }
        })
    } catch (e: any) {
        console.log("error" + e)
        return NextResponse.json(
            { error: "Internal Server Error " + e },
            { status: 500 },
        );
    }
}