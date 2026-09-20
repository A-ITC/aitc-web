import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons";

const relatedLinks = [
  {
    name: "ITC Xアカウント",
    url: "https://x.com/tusitclub",
  },
  {
    name: "ITC Webサイト",
    url: "https://tusitclub.net/",
  },
  {
    name: "AITC Bandcamp",
    url: "https://aitccreators.bandcamp.com/album/boiled",
  },
  {
    name: "AITC SoundCloud",
    url: "https://soundcloud.com/aitc-works",
  },
  {
    name: "AITC Xアカウント",
    url: "https://x.com/AInfTechClub",
  },
];

export function RelatedLinks() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16 md:py-28">
      <p className="my-4 font-['DM_Mono',monospace] text-base font-medium tracking-widest text-[var(--blue)]">
        LINKS
      </p>
      <h2 className="mt-3 mb-8 text-3xl leading-snug tracking-tighter md:text-5xl">
        リンク集
      </h2>
      <div className="border-t border-slate-200">
        {relatedLinks.map(({ name, url }) => (
          <a
            key={url}
            href={url}
            target="_blank"
            rel="noreferrer"
            className="group grid grid-cols-1 gap-2 border-b border-slate-200 px-1 py-5 transition-all duration-200 hover:pl-3 hover:text-[var(--blue)] md:grid-cols-12 md:gap-0"
          >
            <b className="md:col-span-4">{name}</b>
            <span className="flex min-w-0 items-center gap-2 md:col-span-8">
              <span className="break-all text-[var(--mint)]">{url}</span>
              <FontAwesomeIcon
                icon={faArrowUpRightFromSquare}
                className="h-3 w-3 shrink-0"
                aria-hidden="true"
              />
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
