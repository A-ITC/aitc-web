"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  CollectionKind,
  isEventWork,
  Member,
  PersonalWork,
  typeLabel,
  withBasePath,
  Work,
} from "./data";
import { fetchWorkDetail } from "@/lib/api";
import { CoreModal } from "./common/core-modal";

export function WorkCard({
  work,
  onClick,
  members,
  showCreator = false,
  displayTitle,
}: {
  work: Work;
  onClick: () => void;
  members: Member[];
  showCreator?: boolean;
  displayTitle?: string;
}) {
  const title = displayTitle ?? work.title;
  const creators = work.creatorIds
    .map((id) => members.find((member) => member.id === id)?.name ?? id)
    .join(" / ");
  return (
    <button className="group min-w-0 cursor-pointer border-0 bg-transparent p-0 text-left text-inherit focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-400" onClick={onClick}>
      <span className="block aspect-square overflow-hidden bg-slate-200">
        <img
          className="block h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 group-focus-visible:scale-105"
          src={withBasePath(work.thumbnail)}
          alt={`${title}のサムネイル`}
          loading="lazy"
        />
      </span>
      <span className="block py-3">
        <span className="font-['DM_Mono',monospace] text-base font-medium tracking-widest text-[var(--blue)]">{typeLabel[work.type]}</span>
        <strong className="mt-1 block text-base">{title}</strong>
        {showCreator && <small className="mt-1 block text-xs text-slate-500">{creators}</small>}
      </span>
    </button>
  );
}

export function WorkModal({
  work,
  kind,
  works,
  members,
  onClose,
  memberHref,
}: {
  work: Work;
  kind: CollectionKind;
  works: Work[];
  members: Member[];
  onClose: () => void;
  memberHref?: (id: string) => string;
}) {
  const [detail, setDetail] = useState(work);
  const [detailError, setDetailError] = useState(false);
  const related = works
    .filter(
      (item) =>
        item.id !== work.id &&
        item.creatorIds.some((id) => work.creatorIds.includes(id)),
    )
    .slice(0, 3);

  useEffect(() => {
    let cancelled = false;
    setDetail(work);
    setDetailError(false);
    fetchWorkDetail(kind, work.id)
      .then((value) => {
        if (!cancelled) setDetail(value);
      })
      .catch(() => {
        if (!cancelled) setDetailError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [kind, work]);
  const eventWork = isEventWork(detail) ? detail : null;
  const soundcloudLink =
    detail.type === "Music"
      ? detail.links.find((link) => link.url.includes("soundcloud.com"))
      : undefined;
  const soundcloudEmbedUrl = soundcloudLink
    ? `https://w.soundcloud.com/player/?url=${encodeURIComponent(soundcloudLink.url)}&color=%23f58318&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true`
    : undefined;
  const bandcampLink =
    detail.type === "Music"
      ? detail.links.find(
        (link) => link.url.includes("bandcamp.com") && link.embedUrl,
      )
      : undefined;
  const bandcampEmbedUrl = bandcampLink?.embedUrl;
  const credits = eventWork?.credits ?? [];
  const trackCredits = credits.filter(
    (credit) => Number(credit.trackNumber) !== 0,
  );
  const metaCredits = credits.filter(
    (credit) => Number(credit.trackNumber) === 0,
  );
  return (
    <CoreModal ariaLabelledBy="modal-title" onClose={onClose}>
      <img
        className="block h-48 w-full object-cover md:h-80"
        src={withBasePath(detail.thumbnail)}
        alt={`${detail.title}のサムネイル`}
      />
      <div className="px-6 py-8 md:px-10">
        <p className="my-4 font-['DM_Mono',monospace] text-base font-medium tracking-widest text-[var(--blue)]">{typeLabel[detail.type]}</p>
        <h2 id="modal-title" className="mt-1.5 mb-6 text-3xl tracking-tighter md:text-4xl">{detail.title}</h2>
        <dl className="m-0 grid grid-cols-5 gap-2.5 text-sm md:grid-cols-8">
          <dt className="col-span-1 text-slate-500">{kind === "event" ? "イベント" : "制作日"}</dt>
          <dd className="col-span-4 md:col-span-7">
            {eventWork
              ? `${eventWork.event} · ${eventWork.year}`
              : (detail as PersonalWork).createdAt}
          </dd>
        </dl>
        {detailError && (
          <p className="my-7 text-sm leading-relaxed">詳細データを取得できませんでした。</p>
        )}
        <p className="my-7 text-sm leading-relaxed">{detail.description}</p>
        {eventWork && trackCredits.length > 0 && (
          <section className="my-7 [&_a]:text-[var(--blue)] [&_a]:underline [&_h3]:mt-0 [&_h3]:mb-2.5 [&_h3]:text-base [&_table]:w-full [&_table]:min-w-md [&_table]:border-collapse [&_table]:text-sm [&_td]:border-b [&_td]:border-gray-200 [&_td]:px-2 [&_td]:py-2.5 [&_td]:text-left [&_td]:align-top [&_th]:border-b [&_th]:border-gray-200 [&_th]:px-2 [&_th]:py-2.5 [&_th]:text-left [&_th]:font-bold [&_th]:text-slate-500 [&_th]:align-top [&_td:first-child]:w-20 [&_td:first-child]:tabular-nums [&_td:nth-child(2)]:w-1/3" aria-labelledby="credit-list-title">
            <h3 id="credit-list-title">収録作品</h3>
            <div className="overflow-x-auto">
              <table>
                <thead>
                  <tr>
                    <th scope="col">トラック</th>
                    <th scope="col">作者</th>
                    <th scope="col">作品名</th>
                  </tr>
                </thead>
                <tbody>
                  {trackCredits.map((credit) => (
                    <tr key={credit.id}>
                      <td>{credit.trackNumber}</td>
                      <td>
                        {credit.creatorIds.map((id, index) => (
                          <span key={id}>
                            {index > 0 && " / "}
                            {memberHref ? (
                              <Link href={memberHref(id)}>
                                {members.find((member) => member.id === id)?.name ?? id}
                              </Link>
                            ) : (
                              members.find((member) => member.id === id)?.name ?? id
                            )}
                          </span>
                        ))}
                      </td>
                      <td>{credit.workTitle ?? credit.role ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
        {eventWork && metaCredits.length > 0 && (
          <section className="my-7 [&_a]:text-[var(--blue)] [&_a]:underline [&_h3]:mt-0 [&_h3]:mb-2.5 [&_h3]:text-base [&_table]:w-full [&_table]:min-w-md [&_table]:border-collapse [&_table]:text-sm [&_td]:border-b [&_td]:border-gray-200 [&_td]:px-2 [&_td]:py-2.5 [&_td]:text-left [&_td]:align-top [&_td:first-child]:w-1/3" aria-labelledby="meta-credit-list-title">
            <h3 id="meta-credit-list-title">制作協力</h3>
            <div className="overflow-x-auto">
              <table>
                <tbody>
                  {metaCredits.map((credit) => (
                    <tr key={credit.id}>
                      <td>
                        {credit.creatorIds.map((id, index) => (
                          <span key={id}>
                            {index > 0 && " / "}
                            {memberHref ? (
                              <Link href={memberHref(id)}>
                                {members.find((member) => member.id === id)?.name ?? id}
                              </Link>
                            ) : (
                              members.find((member) => member.id === id)?.name ?? id
                            )}
                          </span>
                        ))}
                      </td>
                      <td>{credit.workTitle ?? credit.role ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
        {soundcloudEmbedUrl && (
          <div className="mb-6 overflow-hidden rounded-sm">
            <iframe
              className="block h-40 w-full border-0"
              title={`${detail.title}のSoundCloudプレーヤー`}
              scrolling="no"
              frameBorder="no"
              allow="autoplay"
              loading="lazy"
              src={soundcloudEmbedUrl}
            />
          </div>
        )}
        {bandcampEmbedUrl && (
          <div className="mb-6 overflow-hidden rounded-sm">
            <iframe
              className="block h-28 w-full border-0"
              title={`${detail.title}のBandcampプレーヤー`}
              scrolling="no"
              frameBorder="0"
              loading="lazy"
              src={bandcampEmbedUrl}
            >
              <a href={bandcampLink.url}>{detail.title}</a>
            </iframe>
          </div>
        )}
        {detail.links.map((link) => (
          <a
            key={link.name}
            className="inline-block border-b text-sm font-bold text-[var(--blue)]"
            href={link.url}
            target="_blank"
            rel="noreferrer"
          >
            {link.name} ↗
          </a>
        ))}
      </div>
      {related.length > 0 && (
        <div className="px-6 pb-9 md:px-10">
          <h3 className="my-4 text-sm">関連作品</h3>
          <div className="grid grid-cols-3 gap-2.5">
            {related.map((item) => (
              <span key={item.id}>
                <img className="block aspect-3/2 w-full object-cover" src={withBasePath(item.thumbnail)} alt="" />
                <b className="mt-1 block text-xs">{item.title}</b>
              </span>
            ))}
          </div>
        </div>
      )}
    </CoreModal>
  );
}
