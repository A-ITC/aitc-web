"use server"

import fs from "node:fs";
import path from 'path';

export interface MemberData {
    id: string
    name: string
    avatar: string
    roles: string[]
    inAITC: boolean
}

export interface RoleData {
    id: string
    name: string
    color: string
    roles?: RoleData[]
}

export const getMembers = async (role?: string) => {
    const file = path.join(process.cwd(), `assets/members.json`); // 画像のパス
    const dataJson = await fs.promises.readFile(file, 'utf-8')
    const dat: MemberData[] = JSON.parse(dataJson)
    return dat.filter((member) => {
        if (!member.inAITC) return false
        if (!role) return true
        return member.roles.includes(role)
    })
}

export const getMember = async (id: string) => {
    const file = path.join(process.cwd(), `assets/members.json`); // 画像のパス
    const dataJson = await fs.promises.readFile(file, 'utf-8')
    const dat: MemberData[] = JSON.parse(dataJson)
    return dat.find((d) => d.id === id)
}

export const getRoles = async () => {
    const file = path.join(process.cwd(), `assets/roles.json`); // 画像のパス
    const dataJson = await fs.promises.readFile(file, 'utf-8')
    const dat: RoleData[] = JSON.parse(dataJson)
    return dat
}

