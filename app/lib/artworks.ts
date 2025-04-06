//バックアップ

/*
import { ArtworkData, MusicData, MusicWorkData } from "../value/data";

const api_url = `https://aitc.eulious.com/kyoichi/api/v1`

export const getArtwork = async (id: string) => {
  console.log(`get artwork from ${api_url}/getArtwork?id=${id}`)

  const response = await fetch(`${api_url}/getArtwork?id=${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    }
  })
  if (response.status != 200) {
    console.log(`server status is ${response.status}`)
    return null
  }
  const res: ArtworkData = await response.json()
  return res;
};
export const getMusic = async (id: string) => {
  console.log(`get music from ${api_url}/getMusic?id=${id}`)

  const response = await fetch(`${api_url}/getMusic?id=${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    }
  })
  if (response.status != 200) {
    console.log(`server status is ${response.status}`)
    return null
  }
  const res: MusicData = await response.json()
  return res;
};

export const getArtworks = async (limit?: number) => {
  console.log(`get artworks ${api_url}/getWorks?type=art`)

  if (!limit || limit < 1) limit = 100
  const response = await fetch(`${api_url}/getWorks?type=art`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    }
  })
  if (response.status != 200) {
    console.log(`server status is ${response.status}`)
    return []
  }
  const res: ArtworkData[] = await response.json()
  return res;
};
export const getMusics = async (limit?: number) => {
  console.log(`get musics ${api_url}/getWorks?type=music`)

  if (!limit || limit < 1) limit = 100
  const response = await fetch(`${api_url}/getWorks?type=music`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    }
  })
  if (response.status != 200) {
    console.log(`server status is ${response.status}`)
    return []
  }
  const res: MusicWorkData[] = await response.json()
  return res;
};*/