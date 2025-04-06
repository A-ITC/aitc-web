import Image from "next/image";
import WorksIntroduction from "./works_introduction";
import { imgURL } from "./lib/image";
import { WorkThumbnailData } from "./value/data";
import { getWorks } from "./lib/getWork";
import Link from "next/link";
import LoginDiscord from "./itc/components/discord_login";

export default async function Page() {

  const data: WorkThumbnailData[] = await getWorks()

  return (
    <>
      <div className="grid grid-cols-1 justify-items-center p-2  text-neutral-50">

        <div className="grid grid-cols-1 justify-items-center h-screen w-full z-10 relative">
          <Image fill src={imgURL("logos/aitc_logo_transparent_no_word.png")} alt={"A-ITC"} className="opacity-30 animate-fade-in blur-sm w-full h-full absolute object-cover object-center"></Image>
          <div className="grid grid-cols-1 justify-items-center">
            <p className="text-xl">Welcome to</p>
            <p className="m-5 text-9xl font-bold">A-ITC</p>
            <p className="text-xl text-center">Alumni of Information and Technology Club</p>
          </div>
          <p className="text-center">A-ITCは東京理科大学葛飾キャンパスで活動している ITC の卒業生で構成されるグループです</p>
        </div>


        <hr className="w-full max-w-3xl m-10" />
        <WorksIntroduction works={data} />
        <hr className="w-full max-w-3xl m-10" />

        <div className="">
          <div className="flex items-center justify-center flex-col  bg-neutral-400/50 border-2 border-neutral-0 w-44 rounded-md overflow-hidden">
            <Link href={"/links"} className="text-2xl font-bold z-20 flex items-center justify-center flex-col bg-neutral-200 hover:scale-110 hover:bg-teal-800 w-44 cursor-pointer rounded overflow-hidden drop-shadow-md transition text-neutral-900 hover:text-neutral-100">
              リンク
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
