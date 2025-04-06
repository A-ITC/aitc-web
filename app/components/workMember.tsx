import { getMember } from "../lib/member";

type Props = Readonly<{
    params: { id?: string, name?: string };
}>;

export default async function WorkMember({ params }: Props) {

    let res_str = ""

    if (!params.id) {
        if (params.name) {
            res_str = params.name
        }
    } else {
        const member = await getMember(params.id)
        if (!member) {
            res_str = "not_found!"
        } else {
            res_str = member?.name
        }
    }

    return res_str
}