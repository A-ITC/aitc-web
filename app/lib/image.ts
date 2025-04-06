
export const imgURL = (url: string) => {
    if (process.env.NODE_ENV === "development") {
        return `/kyoichi/dev/${url}`
    } else {
        return `/kyoichi/${url}`
    }
}

export const apiURL = (url: string) => {
    if (process.env.NODE_ENV === "development") {
        return `https://aitc.eulious.com/kyoichi/dev/${url}`
    } else {
        return `https://aitc.eulious.com/kyoichi/${url}`
    }
}