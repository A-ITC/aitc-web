export interface WorkData {
    title: string;
    people: { id?: string, name?: string }[];
}

export interface WorkSectionData {
    header: string;
    data: WorkData[];
}

export interface WorkCompilationData {
    id: string;
    thumbnail: string;
    released_at: string;
    tags: string[];

    title: string;
    text: string;

    image: string;
    embed: string;
    data: WorkSectionData[];
}

export interface WorkThumbnailData {
    id: string;
    thumbnail: string;
    released_at: string;
    tags: string[];
}

/* memo
作品ページについて、個別に凝ったデザインのものを用意するのであれば、embedやtextのデータを持っておく必要はない
作品一覧や検索のために、 thumbnail, authors, tags, released_at くらいあれば十分
music と art も区別させず、tagsで区別させるか、type というプロパティを用意してイラストか曲か区別できるようにすればよい（後から別の形態の作品を載せるときにも楽）
*/